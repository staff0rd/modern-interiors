import type { AssetMetadata, Kind } from "./schema.ts";

export type Completeness = { done: boolean; missing: string[] };

const EMPTY = 0;

const hasText = (value: string | undefined): boolean => (value?.trim().length ?? EMPTY) > EMPTY;

export const computeCompleteness = (kind: Kind, meta: AssetMetadata | undefined): Completeness => {
  const missing: string[] = [];

  if (kind === "single") {
    if (!hasText(meta?.description)) {
      missing.push("description");
    }
  } else if (kind === "animation") {
    if (!meta?.animations?.length) {
      missing.push("animations");
    }
  } else {
    if (!meta?.subSprites?.length) {
      missing.push("sub-sprites");
    }
  }

  return { done: missing.length === EMPTY, missing };
};
