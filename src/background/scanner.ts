import { decideTabClose } from "./close-decision";
import type { ActivitySnapshot, Settings, TabSnapshot } from "../shared/types";

export interface ScannerDependencies {
  listTabs: () => Promise<TabSnapshot[]>;
  getTab: (tabId: number) => Promise<TabSnapshot>;
  loadActivity: (tabId: number) => Promise<ActivitySnapshot | undefined>;
  loadSettings: () => Promise<Settings>;
  removeTab: (tabId: number) => Promise<void>;
  onClosed: (tab: TabSnapshot) => Promise<void>;
}

export interface ScanResult {
  scanned: number;
  closed: number;
  failed: number;
}

function fallbackActivity(tab: TabSnapshot, now: number): ActivitySnapshot {
  const lastAccessed = tab.lastAccessed ?? now;
  return {
    lastInteractionAt: lastAccessed,
    lastPageActivityAt: 0,
    mediaPlaying: false,
    dirtyForm: false,
    observedAt: now,
  };
}

/** Scans all browser windows and safely closes eligible tabs. */
export async function scanTabs(
  dependencies: ScannerDependencies,
  settings: Readonly<Settings>,
  now: number,
): Promise<ScanResult> {
  if (settings.paused) {
    return { scanned: 0, closed: 0, failed: 0 };
  }

  const tabs = await dependencies.listTabs();
  let closed = 0;
  let failed = 0;

  for (const initialTab of tabs) {
    try {
      const activity =
        (await dependencies.loadActivity(initialTab.id)) ??
        fallbackActivity(initialTab, now);
      const initialDecision = decideTabClose(
        initialTab,
        activity,
        settings,
        now,
      );
      if (!initialDecision.close) {
        continue;
      }

      const [currentTab, latestActivity, latestSettings] = await Promise.all([
        dependencies.getTab(initialTab.id),
        dependencies.loadActivity(initialTab.id),
        dependencies.loadSettings(),
      ]);
      const finalDecision = decideTabClose(
        currentTab,
        latestActivity ?? fallbackActivity(currentTab, now),
        latestSettings,
        Date.now(),
      );
      if (!finalDecision.close) {
        continue;
      }

      await dependencies.removeTab(currentTab.id);
      await dependencies.onClosed(currentTab);
      closed += 1;
    } catch {
      failed += 1;
    }
  }

  return { scanned: tabs.length, closed, failed };
}
