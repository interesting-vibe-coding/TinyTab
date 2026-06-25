import { afterEach, describe, expect, it, vi } from "vitest";

import { createActivityObserver } from "../../src/content/activity-observer";

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("createActivityObserver", () => {
  it("sends a clean initial snapshot", () => {
    const send = vi.fn();
    const observer = createActivityObserver({
      document,
      now: () => 500,
      send,
    });

    expect(send).toHaveBeenCalledWith({
      lastInteractionAt: 500,
      lastPageActivityAt: 0,
      mediaPlaying: false,
      dirtyForm: false,
      observedAt: 500,
    });
    observer.disconnect();
  });

  it("reports trusted user interaction without reading input values", () => {
    const send = vi.fn();
    const input = document.createElement("input");
    input.value = "secret";
    document.body.append(input);
    const observer = createActivityObserver({
      document,
      now: () => 1_000,
      send,
      throttleMs: 0,
      isUserEvent: () => true,
    });

    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(send).toHaveBeenLastCalledWith({
      lastInteractionAt: 1_000,
      lastPageActivityAt: 0,
      mediaPlaying: false,
      dirtyForm: true,
      observedAt: 1_000,
    });
    expect(JSON.stringify(send.mock.calls)).not.toContain("secret");
    observer.disconnect();
  });

  it("reports silent media playback", () => {
    const send = vi.fn();
    const video = document.createElement("video");
    document.body.append(video);
    const observer = createActivityObserver({
      document,
      now: () => 2_000,
      send,
      throttleMs: 0,
      isUserEvent: () => true,
    });

    video.dispatchEvent(new Event("play", { bubbles: true }));

    expect(send).toHaveBeenLastCalledWith(
      expect.objectContaining({ mediaPlaying: true }),
    );
    observer.disconnect();
  });

  it("reports observed same-origin resource activity", () => {
    const send = vi.fn();
    let reportPageActivity = (): void => undefined;
    const observer = createActivityObserver({
      document,
      now: () => 3_000,
      send,
      throttleMs: 0,
      observePageActivity: (report) => {
        reportPageActivity = report;
        return (): void => undefined;
      },
    });

    reportPageActivity();

    expect(send).toHaveBeenLastCalledWith(
      expect.objectContaining({ lastPageActivityAt: 3_000 }),
    );
    observer.disconnect();
  });

  it("flushes trailing interaction after throttle window", () => {
    vi.useFakeTimers();
    let now = 1_000;
    const send = vi.fn();
    const observer = createActivityObserver({
      document,
      now: () => now,
      send,
      throttleMs: 1_000,
      isUserEvent: () => true,
    });
    send.mockClear();

    document.dispatchEvent(new Event("scroll"));
    now = 1_500;
    document.dispatchEvent(new Event("scroll"));
    expect(send).not.toHaveBeenCalled();

    now = 2_000;
    vi.advanceTimersByTime(1_000);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenLastCalledWith(
      expect.objectContaining({ lastInteractionAt: 1_500, observedAt: 2_000 }),
    );
    observer.disconnect();
  });
});
