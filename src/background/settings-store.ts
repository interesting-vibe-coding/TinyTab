import { DEFAULT_SETTINGS } from "../shared/defaults";
import type { Settings } from "../shared/types";
import { normalizeWhitelistEntry } from "../shared/whitelist";

export const SETTINGS_KEY = "settings";

function booleanOrDefault(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** Repairs unknown persisted data into valid TinyTab settings. */
export function normalizeSettings(value: unknown): Settings {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const timeout = record.timeoutMinutes;
  const whitelist = Array.isArray(record.whitelist)
    ? [
        ...new Set(
          record.whitelist
            .filter((entry): entry is string => typeof entry === "string")
            .map(normalizeWhitelistEntry)
            .filter(Boolean),
        ),
      ]
    : [];

  return {
    timeoutMinutes:
      typeof timeout === "number" &&
      Number.isInteger(timeout) &&
      timeout >= 1 &&
      timeout <= 10_080
        ? timeout
        : DEFAULT_SETTINGS.timeoutMinutes,
    whitelist,
    skipPinned: booleanOrDefault(
      record.skipPinned,
      DEFAULT_SETTINGS.skipPinned,
    ),
    skipActive: booleanOrDefault(
      record.skipActive,
      DEFAULT_SETTINGS.skipActive,
    ),
    paused: booleanOrDefault(record.paused, DEFAULT_SETTINGS.paused),
    smartClose: booleanOrDefault(
      record.smartClose,
      DEFAULT_SETTINGS.smartClose,
    ),
  };
}

/** Reads settings from local extension storage. */
export async function loadSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return normalizeSettings(result[SETTINGS_KEY]);
}

/** Persists validated settings to local extension storage. */
export async function saveSettings(value: unknown): Promise<Settings> {
  const settings = normalizeSettings(value);
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  return settings;
}
