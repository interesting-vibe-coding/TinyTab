import type { Settings } from "./types";

/** Default TinyTab settings applied after installation and during recovery. */
export const DEFAULT_SETTINGS: Readonly<Settings> = Object.freeze({
  timeoutMinutes: 30,
  whitelist: [],
  skipPinned: true,
  skipActive: true,
  paused: false,
  smartClose: true,
});
