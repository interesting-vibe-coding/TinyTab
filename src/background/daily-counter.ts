import type { DailyCounter } from "../shared/types";

/** Returns a stable local calendar key for daily counter rollover. */
export function localDateKey(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Repairs unknown persisted data into a valid daily counter. */
export function normalizeDailyCounter(value: unknown): DailyCounter {
  if (!value || typeof value !== "object") {
    return { date: "", count: 0 };
  }

  const record = value as Record<string, unknown>;
  return {
    date: typeof record.date === "string" ? record.date : "",
    count:
      typeof record.count === "number" &&
      Number.isInteger(record.count) &&
      record.count >= 0
        ? record.count
        : 0,
  };
}

/** Increments a counter after applying local-day rollover. */
export function incrementDailyCounter(
  current: unknown,
  now: Date,
): DailyCounter {
  const normalized = normalizeDailyCounter(current);
  const date = localDateKey(now);
  return {
    date,
    count: normalized.date === date ? normalized.count + 1 : 1,
  };
}

/** Returns today's count, treating a stale date as zero. */
export function countForToday(current: unknown, now: Date): number {
  const normalized = normalizeDailyCounter(current);
  return normalized.date === localDateKey(now) ? normalized.count : 0;
}
