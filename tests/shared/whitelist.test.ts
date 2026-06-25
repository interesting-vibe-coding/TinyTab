import { describe, expect, it } from "vitest";

import {
  isWhitelisted,
  normalizeWhitelistEntry,
} from "../../src/shared/whitelist";

describe("normalizeWhitelistEntry", () => {
  it("normalizes URLs, casing, paths, and dots", () => {
    expect(normalizeWhitelistEntry(" HTTPS://GitHub.COM/foo ")).toBe(
      "github.com",
    );
    expect(normalizeWhitelistEntry(".Claude.AI.")).toBe("claude.ai");
  });

  it("preserves wildcard intent", () => {
    expect(normalizeWhitelistEntry("*.GitHub.com")).toBe("*.github.com");
  });
});

describe("isWhitelisted", () => {
  it("matches exact hosts and ports safely", () => {
    expect(isWhitelisted("http://localhost:3000/a", ["localhost"])).toBe(true);
    expect(isWhitelisted("https://github.com/a", ["github.com"])).toBe(true);
    expect(isWhitelisted("https://notgithub.com/a", ["github.com"])).toBe(
      false,
    );
  });

  it("matches wildcard subdomains and parent domain", () => {
    expect(isWhitelisted("https://api.github.com", ["*.github.com"])).toBe(
      true,
    );
    expect(isWhitelisted("https://github.com", ["*.github.com"])).toBe(true);
  });
});
