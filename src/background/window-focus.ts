export interface WindowFocusDependencies {
  findActiveTabId: (windowId: number) => Promise<number | undefined>;
  now: () => number;
  touch: (tabId: number, now: number) => Promise<void>;
}

/** Records viewing activity when a browser window gains focus. */
export async function recordWindowFocus(
  windowId: number,
  noWindowId: number,
  dependencies: WindowFocusDependencies,
): Promise<void> {
  if (windowId === noWindowId) return;

  const tabId = await dependencies.findActiveTabId(windowId);
  if (tabId !== undefined) {
    await dependencies.touch(tabId, dependencies.now());
  }
}
