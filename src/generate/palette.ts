import type { Manifest, Metadata, Rect } from "../metadata/schema.ts";
import { groupCells } from "../sheet/groupCells.ts";
import { floorGroup, sheetSize, wallGroup, type SheetImage } from "./tileSheet.ts";
import {
  FLOORS_ONLY_PATH,
  FLOORS_ONLY_URL,
  floorTileFrame,
  paintToken,
  type PaintLayer,
  sheetUrl,
  TILE,
  wallColumns,
  wallFrame,
  wallFrameSpec,
} from "./tileset.ts";

const WALL: PaintLayer = "wall";
const FLOOR: PaintLayer = "floor";

export type PaletteEntry = {
  token: string;
  layer: PaintLayer;
  name: string;
  frame: number;
  col: number;
  row: number;
  rect: Rect;
  image: SheetImage;
};

export type Palette = { walls: PaletteEntry[]; floors: PaletteEntry[] };

export type WallSelection = { sheet: string; group?: string };

const wallEntries = (
  metadata: Metadata | null,
  manifest: Manifest | null,
  wall: WallSelection,
): PaletteEntry[] => {
  const group = wallGroup(metadata, wall.sheet, wall.group);
  if (!group) {
    return [];
  }
  const size = sheetSize(manifest, wall.sheet);
  const spec = wallFrameSpec(group, wallColumns(size.width));
  const image: SheetImage = { size, url: sheetUrl(wall.sheet) };
  return groupCells(group).map((cell) => {
    const frame = wallFrame({ col: cell.col, row: cell.row }, spec);
    return {
      col: cell.col,
      frame,
      image,
      layer: WALL,
      name: cell.name || group.name,
      rect: cell.rect,
      row: cell.row,
      token: paintToken({ frame, layer: WALL }),
    };
  });
};

const floorEntries = (metadata: Metadata | null, image: SheetImage): PaletteEntry[] => {
  const group = floorGroup(metadata);
  if (!group) {
    return [];
  }
  return groupCells(group).map((cell) => {
    const frame = floorTileFrame(cell.rect.left / TILE, cell.rect.top / TILE);
    return {
      col: cell.col,
      frame,
      image,
      layer: FLOOR,
      name: cell.name || group.name,
      rect: cell.rect,
      row: cell.row,
      token: paintToken({ frame, layer: FLOOR }),
    };
  });
};

export const buildPalette = (
  metadata: Metadata | null,
  manifest: Manifest | null,
  wall: WallSelection,
): Palette => ({
  floors: floorEntries(metadata, {
    size: sheetSize(manifest, FLOORS_ONLY_PATH),
    url: FLOORS_ONLY_URL,
  }),
  walls: wallEntries(metadata, manifest, wall),
});
