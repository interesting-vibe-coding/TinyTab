const DEBUG = false;

/** Emits debug diagnostics only in development builds. */
export function debugLog(message: string, context?: unknown): void {
  if (DEBUG) {
    console.debug(`[TinyTab] ${message}`, context);
  }
}

/** Emits recoverable extension errors without throwing into event handlers. */
export function logError(message: string, error: unknown): void {
  console.error(`[TinyTab] ${message}`, error);
}
