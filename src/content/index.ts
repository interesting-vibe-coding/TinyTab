import { createActivityObserver } from "./activity-observer";
import type { ActivityMessage } from "../shared/messages";

createActivityObserver({
  document,
  now: Date.now,
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
