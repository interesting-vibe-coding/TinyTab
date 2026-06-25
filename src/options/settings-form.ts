import { normalizeWhitelistEntry } from "../shared/whitelist";

/** Parses one whitelist rule per line into stable unique patterns. */
export function parseWhitelistText(value: string): string[] {
  return [
    ...new Set(
      value.split(/\r?\n/).map(normalizeWhitelistEntry).filter(Boolean),
    ),
  ];
}

/** Parses a whole-minute timeout bounded between one minute and one week. */
export function parseTimeoutMinutes(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10_080) {
    throw new Error("Timeout must be between 1 and 10080 minutes.");
  }
  return parsed;
}
