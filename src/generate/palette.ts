import type { Manifest, Metadata, Rect } from "../metadata/schema.ts";
import { groupCells } from "../sheet/groupCells.ts";
import { floorGroup, sheetSize, wallGroup, type SheetImage } from "./tileSheet.ts";
import {
  FLOORS_ONLY_PATH,
  FLOORS_ONLY_URL,
  floorTileFrame,
  paintToken,
  type PaintLayer,
  TILE,
  wallFrame,
  WALLS_PATH,
  WALLS_URL,
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

const wallEntries = (metadata: Metadata | null, image: SheetImage): PaletteEntry[] => {
  const group = wallGroup(metadata);
  if (!group) {
    return [];
  }
  return groupCells(group).map((cell) => {
    const frame = wallFrame({ col: cell.col, row: cell.row });
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

export const buildPalette = (metadata: Metadata | null, manifest: Manifest | null): Palette => ({
  floors: floorEntries(metadata, {
    size: sheetSize(manifest, FLOORS_ONLY_PATH),
    url: FLOORS_ONLY_URL,
  }),
  walls: wallEntries(metadata, { size: sheetSize(manifest, WALLS_PATH), url: WALLS_URL }),
});
