import { createActivityObserver } from "./activity-observer";
import type { ActivityMessage } from "../shared/messages";

createActivityObserver({
  document,
  now: Date.now,
  observePageActivity: (report): (() => void) => {
    const observer = new PerformanceObserver((list) => {
      const sameOriginActivity = list.getEntries().some((entry) => {
        try {
          return new URL(entry.name, location.href).origin === location.origin;
        } catch {
          return false;
        }
      });
      if (sameOriginActivity) report();
    });
    observer.observe({ type: "resource", buffered: false });
    return (): void => observer.disconnect();
  },
  send: (snapshot): void => {
    const message: ActivityMessage = {
      type: "tinytab.activity",
      snapshot,
    };
    void chrome.runtime.sendMessage(message).catch(() => {
      // Service worker may be unavailable during browser shutdown.
    });
  },
});
