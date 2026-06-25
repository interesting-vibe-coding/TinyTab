import { isCloseableUrl } from "../shared/url-policy";
import type {
  ActivitySnapshot,
  CloseDecision,
  Settings,
  TabSnapshot,
} from "../shared/types";
import { isWhitelisted } from "../shared/whitelist";

const RECENT_NETWORK_GRACE_MS = 60_000;

/** Determines whether TinyTab may close one tab at a specific instant. */
export function decideTabClose(
  tab: TabSnapshot,
  activity: ActivitySnapshot,
  settings: Readonly<Settings>,
  now: number,
): CloseDecision {
  if (settings.paused) return { close: false, reason: "paused" };
  if (settings.skipActive && tab.active)
    return { close: false, reason: "active" };
  if (settings.skipPinned && tab.pinned)
    return { close: false, reason: "pinned" };
  if (tab.audible) return { close: false, reason: "audible" };
  if (tab.status === "loading") return { close: false, reason: "loading" };
  if (!isCloseableUrl(tab.url))
    return { close: false, reason: "protected-url" };
  if (tab.url && isWhitelisted(tab.url, settings.whitelist))
    return { close: false, reason: "whitelisted" };

  const idleMs = now - activity.lastInteractionAt;
  if (idleMs <= settings.timeoutMinutes * 60_000)
    return { close: false, reason: "not-expired" };

  if (settings.smartClose) {
    if (activity.mediaPlaying)
      return { close: false, reason: "media-playing" };
    if (activity.dirtyForm) return { close: false, reason: "dirty-form" };
    if (now - activity.lastNetworkAt <= RECENT_NETWORK_GRACE_MS)
      return { close: false, reason: "recent-network-activity" };
  }

  return { close: true, reason: "expired" };
}
