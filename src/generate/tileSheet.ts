import type { CSSProperties } from "react";

import type { Manifest, Metadata, Rect, SubSpriteGroup } from "../metadata/schema.ts";
import { FLOORS_ONLY_PATH, WALL_GROUP_LEFT, WALL_GROUP_TOP, WALLS_PATH } from "./tileset.ts";

const ZERO = 0;
const FLOOR_GROUP_NAME = "planks";

export type SheetSize = { width: number; height: number };

export type SheetImage = { url: string; size: SheetSize };

export const wallGroups = (metadata: Metadata | null): SubSpriteGroup[] =>
  metadata?.assets[WALLS_PATH]?.subSpriteGroups ?? [];

const defaultWallGroup = (groups: SubSpriteGroup[]): SubSpriteGroup | undefined =>
  groups.find((group) => group.rect.left === WALL_GROUP_LEFT && group.rect.top === WALL_GROUP_TOP);

export const wallGroup = (metadata: Metadata | null, name?: string): SubSpriteGroup | undefined => {
  const groups = wallGroups(metadata);
  const named = groups.find((group) => group.name === name);
  return named ?? defaultWallGroup(groups);
};

export const floorGroup = (metadata: Metadata | null): SubSpriteGroup | undefined =>
  metadata?.assets[FLOORS_ONLY_PATH]?.subSpriteGroups?.find(
    (group) => group.name === FLOOR_GROUP_NAME,
  );

export const sheetSize = (manifest: Manifest | null, path: string): SheetSize => {
  const entry = manifest?.entries.find((item) => item.path === path);
  return { height: entry?.height ?? ZERO, width: entry?.width ?? ZERO };
};

export const cropStyle = (rect: Rect, image: SheetImage, scale: number): CSSProperties => ({
  backgroundImage: `url(${image.url})`,
  backgroundPosition: `-${rect.left * scale}px -${rect.top * scale}px`,
  backgroundRepeat: "no-repeat",
  backgroundSize: `${image.size.width * scale}px ${image.size.height * scale}px`,
  height: rect.height * scale,
  imageRendering: "pixelated",
  width: rect.width * scale,
});
