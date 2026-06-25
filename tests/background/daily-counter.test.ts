import { describe, expect, it } from "vitest";

import {
  incrementDailyCounter,
  normalizeDailyCounter,
} from "../../src/background/daily-counter";

describe("daily counter", () => {
  it("increments on the same local day", () => {
    expect(
      incrementDailyCounter(
        { date: "2026-06-25", count: 4 },
        new Date("2026-06-25T12:00:00"),
      ),
    ).toEqual({ date: "2026-06-25", count: 5 });
  });

  it("resets before incrementing on a new local day", () => {
    expect(
      incrementDailyCounter(
        { date: "2026-06-24", count: 4 },
        new Date("2026-06-25T00:01:00"),
      ),
    ).toEqual({ date: "2026-06-25", count: 1 });
  });

  it("repairs malformed counters", () => {
    expect(normalizeDailyCounter({ date: 3, count: -8 })).toEqual({
      date: "",
      count: 0,
    });
  });
});
