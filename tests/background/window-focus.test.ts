import { describe, expect, it, vi } from "vitest";

import { recordWindowFocus } from "../../src/background/window-focus";

describe("recordWindowFocus", () => {
  it("records the active tab when a browser window gains focus", async () => {
    const touch = vi.fn(async () => undefined);

    await recordWindowFocus(7, -1, {
      findActiveTabId: async () => 42,
      now: () => 500,
      touch,
    });

    expect(touch).toHaveBeenCalledWith(42, 500);
  });

  it("ignores focus loss and windows without an active tab", async () => {
    const touch = vi.fn(async () => undefined);
    const findActiveTabId = vi.fn(async () => undefined);

    await recordWindowFocus(-1, -1, {
      findActiveTabId,
      now: () => 500,
      touch,
    });

    expect(findActiveTabId).not.toHaveBeenCalled();
    expect(touch).not.toHaveBeenCalled();
  });
});
