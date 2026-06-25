import type { ActivitySnapshot } from "./types";

/** Runtime message sent by TinyTab content observers. */
export interface ActivityMessage {
  type: "tinytab.activity";
  snapshot: ActivitySnapshot;
}

/** Returns whether an unknown runtime value is an activity message. */
export function isActivityMessage(value: unknown): value is ActivityMessage {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    record.type === "tinytab.activity" && typeof record.snapshot === "object"
  );
}
