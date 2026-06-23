import type { SaveState } from "./useMetadata.ts";

export const SAVE_LABELS: Record<SaveState, string> = {
  error: "save failed",
  idle: "",
  saved: "saved",
  saving: "saving…",
};
