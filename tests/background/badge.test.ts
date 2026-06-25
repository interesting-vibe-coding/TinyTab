import { beforeEach, describe, expect, it, vi } from "vitest";

let storedCounter: unknown;

beforeEach(() => {
  storedCounter = undefined;
  vi.resetModules();
  vi.stubGlobal("chrome", {
    storage: {
      local: {
        get: vi.fn(async () => ({ dailyCounter: storedCounter })),
        set: vi.fn(async (values: Record<string, unknown>) => {
          storedCounter = values.dailyCounter;
        }),
      },
    },
    action: {
      setBadgeText: vi.fn(async () => undefined),
      setBadgeBackgroundColor: vi.fn(async () => undefined),
    },
  });
});

describe("recordClosedTab", () => {
  it("serializes concurrent increments", async () => {
    const { recordClosedTab } = await import("../../src/background/badge");

    await Promise.all([recordClosedTab(), recordClosedTab()]);

    expect(storedCounter).toEqual(
      expect.objectContaining({
        count: 2,
      }),
    );
  });
});
