import type { ActivitySnapshot } from "../shared/types";

const ACTIVITY_PREFIX = "tabActivity:";
const activityQueues = new Map<number, Promise<void>>();

function activityKey(tabId: number): string {
  return `${ACTIVITY_PREFIX}${tabId}`;
}

function enqueueActivity(
  tabId: number,
  operation: () => Promise<void>,
): Promise<void> {
  const previous = activityQueues.get(tabId) ?? Promise.resolve();
  const next = previous.then(operation, operation);
  activityQueues.set(tabId, next);
  const cleanup = (): void => {
    if (activityQueues.get(tabId) === next) activityQueues.delete(tabId);
  };
  void next.then(cleanup, cleanup);
  return next;
}

/** Loads one tab's current Smart Close activity snapshot. */
export async function loadActivity(
  tabId: number,
): Promise<ActivitySnapshot | undefined> {
  await activityQueues.get(tabId);
  const key = activityKey(tabId);
  const result = await chrome.storage.session.get(key);
  return result[key] as ActivitySnapshot | undefined;
}

/** Stores one tab's current Smart Close activity snapshot. */
export async function saveActivity(
  tabId: number,
  snapshot: ActivitySnapshot,
): Promise<void> {
  await enqueueActivity(tabId, async () => {
    await chrome.storage.session.set({ [activityKey(tabId)]: snapshot });
  });
}

/** Marks browser interaction and optionally resets document-scoped flags. */
export async function touchActivity(
  tabId: number,
  now: number,
  resetDocumentState = false,
): Promise<void> {
  await enqueueActivity(tabId, async () => {
    const key = activityKey(tabId);
    const stored = resetDocumentState
      ? undefined
      : ((await chrome.storage.session.get(key))[key] as
          | ActivitySnapshot
          | undefined);
    await chrome.storage.session.set({
      [key]: {
        lastInteractionAt: Math.max(now, stored?.lastInteractionAt ?? 0),
        lastPageActivityAt: resetDocumentState
          ? 0
          : (stored?.lastPageActivityAt ?? 0),
        mediaPlaying: resetDocumentState
          ? false
          : (stored?.mediaPlaying ?? false),
        dirtyForm: resetDocumentState ? false : (stored?.dirtyForm ?? false),
        observedAt: now,
      } satisfies ActivitySnapshot,
    });
  });
}

/** Removes stale activity after a tab closes. */
export async function removeActivity(tabId: number): Promise<void> {
  await enqueueActivity(tabId, async () => {
    await chrome.storage.session.remove(activityKey(tabId));
  });
}
