function trimDots(value: string): string {
  return value.replace(/^\.+|\.+$/g, "");
}

/** Converts a user-entered whitelist value into a normalized host pattern. */
export function normalizeWhitelistEntry(entry: string): string {
  const raw = entry.trim().toLowerCase();
  if (!raw) {
    return "";
  }

  const wildcard = raw.startsWith("*.");
  const withoutWildcard = wildcard ? raw.slice(2) : raw;

  let hostname = withoutWildcard;
  try {
    hostname = new URL(
      withoutWildcard.includes("://")
        ? withoutWildcard
        : `https://${withoutWildcard}`,
    ).hostname;
  } catch {
    hostname = withoutWildcard.split("/")[0] ?? "";
  }

  const normalized = trimDots(hostname);
  return wildcard && normalized ? `*.${normalized}` : normalized;
}

/** Returns whether a URL host matches one normalized whitelist rule. */
export function isWhitelisted(
  url: string,
  whitelist: readonly string[],
): boolean {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }

  return whitelist.some((entry) => {
    const rule = normalizeWhitelistEntry(entry);
    if (!rule) {
      return false;
    }

    if (rule.startsWith("*.")) {
      const parent = rule.slice(2);
      return hostname === parent || hostname.endsWith(`.${parent}`);
    }

    return hostname === rule;
  });
}
