import { describe, expect, it, vi } from "vitest";

import {
  scanTabs,
  type ScannerDependencies,
} from "../../src/background/scanner";
import { DEFAULT_SETTINGS } from "../../src/shared/defaults";
import type { ActivitySnapshot, TabSnapshot } from "../../src/shared/types";

const NOW = 10_000_000;
const OLD = NOW - 31 * 60_000;

function tab(overrides: Partial<TabSnapshot> = {}): TabSnapshot {
  return {
    id: 1,
    url: "https://example.com",
    lastAccessed: OLD,
    active: false,
    pinned: false,
    audible: false,
    status: "complete",
    ...overrides,
  };
}

function activity(): ActivitySnapshot {
  return {
    lastInteractionAt: OLD,
    lastPageActivityAt: 0,
    mediaPlaying: false,
    dirtyForm: false,
    observedAt: OLD,
  };
}

function dependencies(
  overrides: Partial<ScannerDependencies> = {},
): ScannerDependencies {
  return {
    listTabs: vi.fn(async () => [tab()]),
    getTab: vi.fn(async () => tab()),
    loadActivity: vi.fn(async () => activity()),
    removeTab: vi.fn(async () => undefined),
    onClosed: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("scanTabs", () => {
  it("closes expired tabs and records successful closes", async () => {
    const deps = dependencies();
    const result = await scanTabs(deps, DEFAULT_SETTINGS, NOW);

    expect(deps.removeTab).toHaveBeenCalledWith(1);
    expect(deps.onClosed).toHaveBeenCalledWith(tab());
    expect(result.closed).toBe(1);
  });

  it("rechecks state and keeps a tab activated during the scan", async () => {
    const deps = dependencies({
      getTab: vi.fn(async () => tab({ active: true })),
    });

    const result = await scanTabs(deps, DEFAULT_SETTINGS, NOW);

    expect(deps.removeTab).not.toHaveBeenCalled();
    expect(result.closed).toBe(0);
  });

  it("uses lastAccessed when session activity is absent", async () => {
    const deps = dependencies({
      loadActivity: vi.fn(async () => undefined),
    });

    const result = await scanTabs(deps, DEFAULT_SETTINGS, NOW);

    expect(result.closed).toBe(1);
  });

  it("continues after a tab disappears", async () => {
    const removeTab = vi
      .fn<ScannerDependencies["removeTab"]>()
      .mockRejectedValueOnce(new Error("No tab with id"))
      .mockResolvedValueOnce(undefined);
    const deps = dependencies({
      listTabs: vi.fn(async () => [tab({ id: 1 }), tab({ id: 2 })]),
      getTab: vi.fn(async (id) => tab({ id })),
      removeTab,
    });

    const result = await scanTabs(deps, DEFAULT_SETTINGS, NOW);

    expect(result).toEqual({ scanned: 2, closed: 1, failed: 1 });
  });
});
