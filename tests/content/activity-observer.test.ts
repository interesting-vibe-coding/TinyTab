import { afterEach, describe, expect, it, vi } from "vitest";

import { createActivityObserver } from "../../src/content/activity-observer";

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("createActivityObserver", () => {
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
    });

    video.dispatchEvent(new Event("play", { bubbles: true }));

    expect(send).toHaveBeenLastCalledWith(
      expect.objectContaining({ mediaPlaying: true }),
    );
    observer.disconnect();
  });

  it("reports DOM changes as page activity", async () => {
    const send = vi.fn();
    const observer = createActivityObserver({
      document,
      now: () => 3_000,
      send,
      throttleMs: 0,
    });

    document.body.append(document.createElement("div"));
    await Promise.resolve();

    expect(send).toHaveBeenLastCalledWith(
      expect.objectContaining({ lastPageActivityAt: 3_000 }),
    );
    observer.disconnect();
  });
});
