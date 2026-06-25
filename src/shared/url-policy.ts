const CLOSEABLE_PROTOCOLS = new Set(["http:", "https:"]);
const PDF_VIEWER_EXTENSION_ID = "mhjfbmdgcfjbbpaeojofohoefgiehjai";

/** Returns whether a URL belongs to a normal closeable web page. */
export function isCloseableUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    if (!CLOSEABLE_PROTOCOLS.has(parsed.protocol)) {
      return false;
    }

    if (parsed.hostname === PDF_VIEWER_EXTENSION_ID) {
      return false;
    }

    return !parsed.pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}
