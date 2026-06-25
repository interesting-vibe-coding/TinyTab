import { describe, expect, it } from "vitest";

import { decideTabClose } from "../../src/background/close-decision";
import { DEFAULT_SETTINGS } from "../../src/shared/defaults";
import type { ActivitySnapshot, TabSnapshot } from "../../src/shared/types";

const NOW = 2_000_000;
const EXPIRED = NOW - 31 * 60_000;

function tab(overrides: Partial<TabSnapshot> = {}): TabSnapshot {
  return {
    id: 7,
    url: "https://example.com",
    active: false,
    pinned: false,
    audible: false,
    status: "complete",
    ...overrides,
  };
}

function activity(
  overrides: Partial<ActivitySnapshot> = {},
): ActivitySnapshot {
  return {
    lastInteractionAt: EXPIRED,
    lastNetworkAt: 0,
    mediaPlaying: false,
    dirtyForm: false,
    observedAt: NOW,
    ...overrides,
  };
}

describe("decideTabClose", () => {
  it("closes a genuinely idle expired tab", () => {
    expect(
      decideTabClose(tab(), activity(), DEFAULT_SETTINGS, NOW),
    ).toEqual({ close: true, reason: "expired" });
  });

  it("keeps a tab at the timeout boundary", () => {
    expect(
      decideTabClose(
        tab(),
        activity({ lastInteractionAt: NOW - 30 * 60_000 }),
        DEFAULT_SETTINGS,
        NOW,
      ).close,
    ).toBe(false);
  });

  it.each([
    [tab({ active: true }), activity(), "active"],
    [tab({ pinned: true }), activity(), "pinned"],
    [tab({ audible: true }), activity(), "audible"],
    [tab({ status: "loading" }), activity(), "loading"],
    [tab({ url: "chrome://settings" }), activity(), "protected-url"],
    [tab({ url: "https://github.com" }), activity(), "whitelisted"],
    [tab(), activity({ mediaPlaying: true }), "media-playing"],
    [tab(), activity({ dirtyForm: true }), "dirty-form"],
    [
      tab(),
      activity({ lastNetworkAt: NOW - 10_000 }),
      "recent-network-activity",
    ],
  ] as const)("protects %s because %s", (candidate, signal, expected) => {
    expect(
      decideTabClose(
        candidate,
        signal,
        { ...DEFAULT_SETTINGS, whitelist: ["github.com"] },
        NOW,
      ),
    ).toEqual({ close: false, reason: expected });
  });
});
