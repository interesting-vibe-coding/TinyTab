import type { ActivitySnapshot } from "../shared/types";

export interface ActivityObserverOptions {
  document: Document;
  now: () => number;
  send: (snapshot: ActivitySnapshot) => void;
  throttleMs?: number;
}

export interface ActivityObserver {
  disconnect: () => void;
}

/** Observes coarse activity signals without reading page content or field values. */
export function createActivityObserver(
  options: ActivityObserverOptions,
): ActivityObserver {
  const throttleMs = options.throttleMs ?? 1_000;
  const playingMedia = new Set<EventTarget>();
  let lastSentAt = Number.NEGATIVE_INFINITY;
  let snapshot: ActivitySnapshot = {
    lastInteractionAt: options.now(),
    lastPageActivityAt: 0,
    mediaPlaying: false,
    dirtyForm: false,
    observedAt: options.now(),
  };

  const report = (updates: Partial<ActivitySnapshot>): void => {
    const now = options.now();
    snapshot = { ...snapshot, ...updates, observedAt: now };
    if (now - lastSentAt >= throttleMs) {
      lastSentAt = now;
      options.send({ ...snapshot });
    }
  };

  const onInteraction = (event: Event): void => {
    if ("isTrusted" in event && event.isTrusted === false && throttleMs > 0) {
      return;
    }
    report({
      lastInteractionAt: options.now(),
      dirtyForm:
        snapshot.dirtyForm ||
        event.type === "input" ||
        event.type === "beforeinput" ||
        event.type === "change",
    });
  };

  const onMedia = (event: Event): void => {
    if (event.type === "play") {
      playingMedia.add(event.target ?? options.document);
    } else if (event.target) {
      playingMedia.delete(event.target);
    }
    report({ mediaPlaying: playingMedia.size > 0 });
  };

  const interactionEvents = [
    "pointerdown",
    "keydown",
    "scroll",
    "input",
    "beforeinput",
    "change",
  ] as const;
  for (const eventName of interactionEvents) {
    options.document.addEventListener(eventName, onInteraction, {
      capture: true,
      passive: true,
    });
  }
  for (const eventName of ["play", "pause", "ended"] as const) {
    options.document.addEventListener(eventName, onMedia, true);
  }

  const mutationObserver = new MutationObserver(() => {
    report({ lastPageActivityAt: options.now() });
  });
  mutationObserver.observe(options.document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return {
    disconnect: (): void => {
      mutationObserver.disconnect();
      for (const eventName of interactionEvents) {
        options.document.removeEventListener(eventName, onInteraction, true);
      }
      for (const eventName of ["play", "pause", "ended"] as const) {
        options.document.removeEventListener(eventName, onMedia, true);
      }
    },
  };
}
