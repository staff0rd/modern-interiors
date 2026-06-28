import type { CSSProperties } from "react";

import type { Manifest, Metadata, Rect, SubSpriteGroup } from "../metadata/schema.ts";
import { GROUP_INDEX, WALLS_PATH, WALLS_URL } from "./tileset.ts";

const ZERO = 0;

export type SheetSize = { width: number; height: number };

export const wallGroup = (metadata: Metadata | null): SubSpriteGroup | undefined =>
  metadata?.assets[WALLS_PATH]?.subSpriteGroups?.[GROUP_INDEX];

export const sheetSize = (manifest: Manifest | null): SheetSize => {
  const entry = manifest?.entries.find((item) => item.path === WALLS_PATH);
  return { height: entry?.height ?? ZERO, width: entry?.width ?? ZERO };
};

export const cropStyle = (rect: Rect, sheet: SheetSize, scale: number): CSSProperties => ({
  backgroundImage: `url(${WALLS_URL})`,
  backgroundPosition: `-${rect.left * scale}px -${rect.top * scale}px`,
  backgroundRepeat: "no-repeat",
  backgroundSize: `${sheet.width * scale}px ${sheet.height * scale}px`,
  height: rect.height * scale,
  imageRendering: "pixelated",
  width: rect.width * scale,
});
