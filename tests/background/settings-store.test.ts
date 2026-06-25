import { describe, expect, it } from "vitest";

import { normalizeSettings } from "../../src/background/settings-store";

describe("normalizeSettings", () => {
  it("repairs malformed values with defaults", () => {
    expect(
      normalizeSettings({
        timeoutMinutes: -1,
        whitelist: ["GitHub.com", 42, "", "github.com"],
        skipPinned: "yes",
        paused: true,
      }),
    ).toEqual({
      timeoutMinutes: 30,
      whitelist: ["github.com"],
      skipPinned: true,
      skipActive: true,
      paused: true,
      smartClose: true,
    });
  });

  it("accepts bounded timeout and explicit booleans", () => {
    expect(
      normalizeSettings({
        timeoutMinutes: 90,
        whitelist: ["*.Example.com"],
        skipPinned: false,
        skipActive: false,
        paused: false,
        smartClose: false,
      }),
    ).toEqual({
      timeoutMinutes: 90,
      whitelist: ["*.example.com"],
      skipPinned: false,
      skipActive: false,
      paused: false,
      smartClose: false,
    });
  });
});
