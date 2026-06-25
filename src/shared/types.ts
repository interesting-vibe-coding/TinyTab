/** User-configurable TinyTab behavior. */
export interface Settings {
  timeoutMinutes: number;
  whitelist: string[];
  skipPinned: boolean;
  skipActive: boolean;
  paused: boolean;
  smartClose: boolean;
}

/** Coarse page signals used by Smart Close. */
export interface ActivitySnapshot {
  lastInteractionAt: number;
  lastPageActivityAt: number;
  mediaPlaying: boolean;
  dirtyForm: boolean;
  observedAt: number;
}

/** Browser tab fields needed by the close-decision engine. */
export interface TabSnapshot {
  id: number;
  url?: string;
  lastAccessed?: number;
  active: boolean;
  pinned: boolean;
  audible: boolean;
  status?: "unloaded" | "loading" | "complete";
}

/** Persistent count displayed in the toolbar badge. */
export interface DailyCounter {
  date: string;
  count: number;
}

/** Stable explanation emitted by the close-decision engine. */
export type CloseReason =
  | "paused"
  | "active"
  | "pinned"
  | "audible"
  | "loading"
  | "protected-url"
  | "whitelisted"
  | "not-expired"
  | "media-playing"
  | "dirty-form"
  | "recent-page-activity"
  | "expired";

/** Deterministic close outcome and its explanation. */
export interface CloseDecision {
  close: boolean;
  reason: CloseReason;
}
