import { countForToday, incrementDailyCounter } from "./daily-counter";
import type { DailyCounter } from "../shared/types";

const COUNTER_KEY = "dailyCounter";
let counterQueue: Promise<void> = Promise.resolve();

async function loadCounter(): Promise<unknown> {
  const result = await chrome.storage.local.get(COUNTER_KEY);
  return result[COUNTER_KEY];
}

/** Returns today's number of tabs closed by TinyTab. */
export async function getClosedToday(): Promise<number> {
  return countForToday(await loadCounter(), new Date());
}

/** Increments today's close count and refreshes toolbar badge. */
export async function recordClosedTab(): Promise<DailyCounter> {
  let result: DailyCounter | undefined;
  const update = async (): Promise<void> => {
    result = incrementDailyCounter(await loadCounter(), new Date());
    await chrome.storage.local.set({ [COUNTER_KEY]: result });
    await refreshBadge(result.count);
  };
  counterQueue = counterQueue.then(update, update);
  await counterQueue;
  if (!result) throw new Error("Daily counter update failed.");
  return result;
}

/** Refreshes toolbar badge using today's persisted count. */
export async function refreshBadge(knownCount?: number): Promise<void> {
  const count = knownCount ?? (await getClosedToday());
  await chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
  await chrome.action.setBadgeBackgroundColor({ color: "#6F8FAF" });
}
