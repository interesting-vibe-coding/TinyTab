import {
  loadActivity,
  removeActivity,
  saveActivity,
  touchActivity,
} from "./activity-store";
import { recordClosedTab, refreshBadge } from "./badge";
import { scanTabs } from "./scanner";
import { loadSettings } from "./settings-store";
import { recordWindowFocus } from "./window-focus";
import { isActivityMessage } from "../shared/messages";
import { logError } from "../shared/logger";
import type { TabSnapshot } from "../shared/types";

const SCAN_ALARM = "tinytab.scan";

function toTabSnapshot(tab: chrome.tabs.Tab): TabSnapshot | undefined {
  if (tab.id === undefined) {
    return undefined;
  }
  return {
    id: tab.id,
    ...(tab.url === undefined ? {} : { url: tab.url }),
    ...(tab.lastAccessed === undefined
      ? {}
      : { lastAccessed: tab.lastAccessed }),
    active: tab.active,
    pinned: tab.pinned,
    audible: tab.audible ?? false,
    ...(tab.status === undefined ? {} : { status: tab.status }),
  };
}

async function ensureAlarm(): Promise<void> {
  const existing = await chrome.alarms.get(SCAN_ALARM);
  if (!existing) {
    await chrome.alarms.create(SCAN_ALARM, { periodInMinutes: 1 });
  }
}

async function runScan(): Promise<void> {
  await refreshBadge();
  const settings = await loadSettings();
  await scanTabs(
    {
      listTabs: async (): Promise<TabSnapshot[]> =>
        (await chrome.tabs.query({}))
          .map(toTabSnapshot)
          .filter((tab): tab is TabSnapshot => tab !== undefined),
      getTab: async (tabId): Promise<TabSnapshot> => {
        const tab = toTabSnapshot(await chrome.tabs.get(tabId));
        if (!tab) throw new Error(`Missing tab ${tabId}`);
        return tab;
      },
      loadActivity,
      loadSettings,
      removeTab: async (tabId): Promise<void> => chrome.tabs.remove(tabId),
      onClosed: async (): Promise<void> => {
        await recordClosedTab();
      },
    },
    settings,
    Date.now(),
  );
}

chrome.runtime.onInstalled.addListener(() => {
  void ensureAlarm()
    .then(() => refreshBadge())
    .catch((error: unknown) => {
      logError("Installation setup failed", error);
    });
});

chrome.runtime.onStartup.addListener(() => {
  void ensureAlarm()
    .then(() => refreshBadge())
    .catch((error: unknown) => {
      logError("Startup setup failed", error);
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SCAN_ALARM) {
    void runScan().catch((error: unknown) => {
      logError("Tab scan failed", error);
    });
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  void touchActivity(tabId, Date.now()).catch((error: unknown) => {
    logError("Could not record tab activation", error);
  });
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  void recordWindowFocus(windowId, chrome.windows.WINDOW_ID_NONE, {
    findActiveTabId: async (focusedWindowId): Promise<number | undefined> =>
      (await chrome.tabs.query({ active: true, windowId: focusedWindowId }))[0]
        ?.id,
    now: Date.now,
    touch: touchActivity,
  }).catch((error: unknown) => {
    logError("Could not record window focus", error);
  });
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.id !== undefined) {
    void touchActivity(tab.id, Date.now()).catch((error: unknown) => {
      logError("Could not initialize tab activity", error);
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    void touchActivity(tabId, Date.now(), true).catch((error: unknown) => {
      logError("Could not reset tab activity", error);
    });
  } else if (changeInfo.url !== undefined || changeInfo.status === "complete") {
    void touchActivity(tabId, Date.now()).catch((error: unknown) => {
      logError("Could not record tab update", error);
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void removeActivity(tabId).catch((error: unknown) => {
    logError("Could not remove tab activity", error);
  });
});

chrome.runtime.onMessage.addListener((message: unknown, sender) => {
  if (isActivityMessage(message) && sender.tab?.id !== undefined) {
    void saveActivity(sender.tab.id, message.snapshot).catch(
      (error: unknown) => {
        logError("Could not save page activity", error);
      },
    );
  }
});

void ensureAlarm().catch((error: unknown) => {
  logError("Could not ensure scan alarm", error);
});
