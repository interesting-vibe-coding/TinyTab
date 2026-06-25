import type { ActivitySnapshot } from "../shared/types";

const ACTIVITY_KEY = "tabActivity";

type ActivityMap = Record<string, ActivitySnapshot>;

async function loadMap(): Promise<ActivityMap> {
  const result = await chrome.storage.session.get(ACTIVITY_KEY);
  const value = result[ACTIVITY_KEY];
  return value && typeof value === "object" ? (value as ActivityMap) : {};
}

/** Loads one tab's current Smart Close activity snapshot. */
export async function loadActivity(
  tabId: number,
): Promise<ActivitySnapshot | undefined> {
  const map = await loadMap();
  return map[String(tabId)];
}

/** Merges and stores one tab's current Smart Close activity snapshot. */
export async function saveActivity(
  tabId: number,
  snapshot: ActivitySnapshot,
): Promise<void> {
  const map = await loadMap();
  map[String(tabId)] = snapshot;
  await chrome.storage.session.set({ [ACTIVITY_KEY]: map });
}

/** Marks direct browser interaction with a tab. */
export async function touchActivity(tabId: number, now: number): Promise<void> {
  const current = await loadActivity(tabId);
  await saveActivity(tabId, {
    lastInteractionAt: now,
    lastPageActivityAt: current?.lastPageActivityAt ?? 0,
    mediaPlaying: current?.mediaPlaying ?? false,
    dirtyForm: current?.dirtyForm ?? false,
    observedAt: now,
  });
}

/** Removes stale activity after a tab closes. */
export async function removeActivity(tabId: number): Promise<void> {
  const map = await loadMap();
  delete map[String(tabId)];
  await chrome.storage.session.set({ [ACTIVITY_KEY]: map });
}
