import { describe, expect, it } from "vitest";

import { isCloseableUrl } from "../../src/shared/url-policy";

describe("isCloseableUrl", () => {
  it.each([
    undefined,
    "",
    "chrome://settings",
    "edge://settings",
    "devtools://devtools/bundled/inspector.html",
    "chrome-extension://abc/options.html",
    "about:blank",
    "file:///tmp/report.pdf",
    "https://example.com/report.pdf",
    "chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai/index.html",
  ])("rejects protected URL %s", (url) => {
    expect(isCloseableUrl(url)).toBe(false);
  });

  it.each(["https://example.com", "http://localhost:3000/app"])(
    "accepts normal web URL %s",
    (url) => {
      expect(isCloseableUrl(url)).toBe(true);
    },
  );
});
