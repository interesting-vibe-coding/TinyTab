import { describe, expect, it } from "vitest";

import {
  parseTimeoutMinutes,
  parseWhitelistText,
} from "../../src/options/settings-form";

describe("parseWhitelistText", () => {
  it("normalizes, deduplicates, and drops empty lines", () => {
    expect(
      parseWhitelistText(`
        GitHub.com
        *.Example.com
        github.com

        localhost
      `),
    ).toEqual(["github.com", "*.example.com", "localhost"]);
  });
});

describe("parseTimeoutMinutes", () => {
  it.each([
    ["30", 30],
    ["1", 1],
    ["10080", 10080],
  ])("accepts %s", (input, expected) => {
    expect(parseTimeoutMinutes(input)).toBe(expected);
  });

  it.each(["", "0", "-1", "2.5", "10081", "abc"])("rejects %s", (input) => {
    expect(() => parseTimeoutMinutes(input)).toThrow("1 and 10080");
  });
});
