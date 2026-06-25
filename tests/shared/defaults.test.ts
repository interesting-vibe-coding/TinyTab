import { describe, expect, it } from "vitest";

import { DEFAULT_SETTINGS } from "../../src/shared/defaults";

describe("DEFAULT_SETTINGS", () => {
  it("uses a 30 minute timeout", () => {
    expect(DEFAULT_SETTINGS.timeoutMinutes).toBe(30);
  });

  it("enables every safety preference", () => {
    expect(DEFAULT_SETTINGS.smartClose).toBe(true);
    expect(DEFAULT_SETTINGS.skipActive).toBe(true);
    expect(DEFAULT_SETTINGS.skipPinned).toBe(true);
  });

  it("starts unpaused with an empty whitelist", () => {
    expect(DEFAULT_SETTINGS.paused).toBe(false);
    expect(DEFAULT_SETTINGS.whitelist).toEqual([]);
  });
});
