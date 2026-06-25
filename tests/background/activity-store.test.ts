import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ActivitySnapshot } from "../../src/shared/types";

const storage = new Map<string, unknown>();

beforeEach(() => {
  storage.clear();
  vi.resetModules();
  vi.stubGlobal("chrome", {
    storage: {
      session: {
        get: vi.fn(async (key: string) => ({ [key]: storage.get(key) })),
        set: vi.fn(async (values: Record<string, unknown>) => {
          for (const [key, value] of Object.entries(values)) {
            storage.set(key, value);
          }
        }),
        remove: vi.fn(async (key: string) => {
          storage.delete(key);
        }),
      },
    },
  });
});

function snapshot(overrides: Partial<ActivitySnapshot> = {}): ActivitySnapshot {
  return {
    lastInteractionAt: 100,
    lastPageActivityAt: 0,
    mediaPlaying: false,
    dirtyForm: false,
    observedAt: 100,
    ...overrides,
  };
}

describe("activity store", () => {
  it("serializes writes for one tab", async () => {
    const { loadActivity, saveActivity, touchActivity } =
      await import("../../src/background/activity-store");

    await Promise.all([
      saveActivity(1, snapshot({ mediaPlaying: true })),
      touchActivity(1, 200),
    ]);

    expect(await loadActivity(1)).toEqual(
      snapshot({
        lastInteractionAt: 200,
        mediaPlaying: true,
        observedAt: 200,
      }),
    );
  });

  it("resets document-scoped flags on navigation", async () => {
    const { loadActivity, saveActivity, touchActivity } =
      await import("../../src/background/activity-store");
    await saveActivity(
      1,
      snapshot({ mediaPlaying: true, dirtyForm: true, lastPageActivityAt: 90 }),
    );

    await touchActivity(1, 300, true);

    expect(await loadActivity(1)).toEqual(
      snapshot({
        lastInteractionAt: 300,
        observedAt: 300,
      }),
    );
  });

  it("does not let a stale content snapshot erase newer browser interaction", async () => {
    const { loadActivity, saveActivity, touchActivity } =
      await import("../../src/background/activity-store");
    await touchActivity(1, 500);

    await saveActivity(
      1,
      snapshot({
        lastInteractionAt: 100,
        lastPageActivityAt: 200,
        observedAt: 300,
      }),
    );

    expect(await loadActivity(1)).toEqual(
      snapshot({
        lastInteractionAt: 500,
        lastPageActivityAt: 200,
        observedAt: 500,
      }),
    );
  });
});
