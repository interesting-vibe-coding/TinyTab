import type { ActivitySnapshot } from "../shared/types";

export interface ActivityObserverOptions {
  document: Document;
  now: () => number;
  send: (snapshot: ActivitySnapshot) => void;
  throttleMs?: number;
  isUserEvent?: (event: Event) => boolean;
  observePageActivity?: (report: () => void) => () => void;
}

export interface ActivityObserver {
  disconnect: () => void;
}

/** Observes coarse activity signals without reading page content or field values. */
export function createActivityObserver(
  options: ActivityObserverOptions,
): ActivityObserver {
  const throttleMs = options.throttleMs ?? 1_000;
  const isUserEvent =
    options.isUserEvent ?? ((event: Event): boolean => event.isTrusted);
  const playingMedia = new Set<EventTarget>();
  let lastSentAt = Number.NEGATIVE_INFINITY;
  let trailingTimer: ReturnType<typeof setTimeout> | undefined;
  let snapshot: ActivitySnapshot = {
    lastInteractionAt: options.now(),
    lastPageActivityAt: 0,
    mediaPlaying: false,
    dirtyForm: false,
    observedAt: options.now(),
  };

  const sendSnapshot = (): void => {
    const now = options.now();
    lastSentAt = now;
    snapshot = { ...snapshot, observedAt: now };
    options.send({ ...snapshot });
  };

  const report = (
    updates: Partial<ActivitySnapshot>,
    immediate = false,
  ): void => {
    snapshot = { ...snapshot, ...updates };
    const elapsed = options.now() - lastSentAt;
    if (immediate || elapsed >= throttleMs) {
      if (trailingTimer !== undefined) {
        clearTimeout(trailingTimer);
        trailingTimer = undefined;
      }
      sendSnapshot();
    } else if (trailingTimer === undefined) {
      trailingTimer = setTimeout(() => {
        trailingTimer = undefined;
        sendSnapshot();
      }, throttleMs - elapsed);
    }
  };

  const onInteraction = (event: Event): void => {
    if (!isUserEvent(event)) {
      return;
    }
    const edited =
      event.type === "input" ||
      event.type === "beforeinput" ||
      event.type === "change";
    report(
      {
        lastInteractionAt: options.now(),
        dirtyForm: snapshot.dirtyForm || edited,
      },
      edited,
    );
  };

  const onMedia = (event: Event): void => {
    if (event.type === "play") {
      playingMedia.add(event.target ?? options.document);
    } else if (event.target) {
      playingMedia.delete(event.target);
    }
    report({ mediaPlaying: playingMedia.size > 0 }, true);
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

  const stopPageActivity =
    options.observePageActivity?.(() => {
      report({ lastPageActivityAt: options.now() });
    }) ?? ((): void => undefined);

  sendSnapshot();

  return {
    disconnect: (): void => {
      if (trailingTimer !== undefined) {
        clearTimeout(trailingTimer);
      }
      stopPageActivity();
      for (const eventName of interactionEvents) {
        options.document.removeEventListener(eventName, onInteraction, true);
      }
      for (const eventName of ["play", "pause", "ended"] as const) {
        options.document.removeEventListener(eventName, onMedia, true);
      }
    },
  };
}
