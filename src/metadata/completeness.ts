import type { AssetMetadata, Kind, SubSpriteGroup } from "./schema.ts";

export type Completeness = { done: boolean; missing: string[] };

const EMPTY = 0;
const ONE = 1;

const hasText = (value: string | undefined): boolean => (value?.trim().length ?? EMPTY) > EMPTY;

const singleMissing = (meta: AssetMetadata | undefined): string[] => {
  const missing: string[] = [];
  if (!hasText(meta?.description)) {
    missing.push("description");
  }
  if (!meta?.orientation) {
    missing.push("orientation");
  }
  return missing;
};

const cellCount = (group: SubSpriteGroup): number =>
  Math.max(ONE, Math.floor(group.rect.width / group.cellWidth)) *
  Math.max(ONE, Math.floor(group.rect.height / group.cellHeight));

const groupComplete = (group: SubSpriteGroup): boolean => {
  if (!hasText(group.description)) {
    return false;
  }
  if (group.variantNames.length !== cellCount(group)) {
    return false;
  }
  return group.variantNames.every((name) => hasText(name));
};

const sheetMissing = (meta: AssetMetadata | undefined): string[] => {
  const subSprites = meta?.subSprites ?? [];
  const groups = meta?.subSpriteGroups ?? [];
  if (subSprites.length + groups.length === EMPTY) {
    return ["sub-sprites"];
  }
  const missing: string[] = [];
  if (subSprites.some((subSprite) => !hasText(subSprite.description))) {
    missing.push("sub-sprite descriptions");
  }
  if (groups.some((group) => !groupComplete(group))) {
    missing.push("group details");
  }
  return missing;
};

const missingFields = (kind: Kind, meta: AssetMetadata | undefined): string[] => {
  if (kind === "single") {
    return singleMissing(meta);
  }
  if (kind === "animation") {
    if (!meta?.animations?.length) {
      return ["animations"];
    }
    return [];
  }
  return sheetMissing(meta);
};

export const computeCompleteness = (kind: Kind, meta: AssetMetadata | undefined): Completeness => {
  const missing = missingFields(kind, meta);
  return { done: missing.length === EMPTY, missing };
};
