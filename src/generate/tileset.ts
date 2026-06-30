import type { AutotileLayer, SubSpriteGroup } from "../metadata/schema.ts";
import { groupCells } from "../sheet/groupCells.ts";

const FLOORS_NAME = "Room_Builder_Floors_16x16.png";
const FLOORS_ONLY_NAME = "Floors_only_16x16.png";

export const TILE = 16;
export const WALLS_KEY = "rb-3d-walls";
export const FLOORS_KEY = "rb-floors";
export const FLOORS_ONLY_KEY = "rb-floors-only";
const WALLS_NAME = "Room_Builder_3d_walls_16x16.png";
export const WALLS_PATH = `1_Interiors/16x16/Room_Builder_subfiles/${WALLS_NAME}`;
const FLOORS_PATH = `1_Interiors/16x16/Room_Builder_subfiles/${FLOORS_NAME}`;
export const FLOORS_ONLY_PATH = `1_Interiors/16x16/Old stuff/${FLOORS_ONLY_NAME}`;
export const WALLS_URL = `/moderninteriors-win/${WALLS_PATH}`;
export const FLOORS_URL = `/moderninteriors-win/${FLOORS_PATH}`;
export const FLOORS_ONLY_URL = `/moderninteriors-win/1_Interiors/16x16/Old%20stuff/${FLOORS_ONLY_NAME}`;

const WALLS_COLS = 24;
const FLOORS_COLS = 15;
const FLOORS_ONLY_COLS = 16;

const DEFAULT_GROUP_COL = 16;
const DEFAULT_GROUP_ROW = 28;

export const WALL_GROUP_LEFT = DEFAULT_GROUP_COL * TILE;
export const WALL_GROUP_TOP = DEFAULT_GROUP_ROW * TILE;

export type Cell = { col: number; row: number };

export type WallOffset = { col: number; row: number };

export const wallOffsetOf = (group: SubSpriteGroup): WallOffset => ({
  col: group.rect.left / TILE,
  row: group.rect.top / TILE,
});

export const wallFrame = (cell: Cell, offset: WallOffset): number =>
  (offset.row + cell.row) * WALLS_COLS + (offset.col + cell.col);

const FLOOR_COL = 5;
const FLOOR_ROW = 3;

const floorFrame = (col: number, row: number): number => row * FLOORS_COLS + col;

export const floorTileFrame = (col: number, row: number): number => row * FLOORS_ONLY_COLS + col;

export const FLOOR_CELL = floorFrame(FLOOR_COL, FLOOR_ROW);

export const WALL_LAYER: AutotileLayer = "wall";

const PAINT_LAYER_VALUES = ["wall", "floor"] as const;
export type PaintLayer = (typeof PAINT_LAYER_VALUES)[number];

export type PaintTile = { layer: PaintLayer; frame: number };

export type PaintMap = Record<string, string>;

const TOKEN_PARTS = 2;

const isPaintLayer = (value: string | undefined): value is PaintLayer =>
  PAINT_LAYER_VALUES.includes(value as PaintLayer);

export const paintToken = (tile: PaintTile): string => `${tile.layer}:${tile.frame}`;

export const parsePaintToken = (token: string): PaintTile | undefined => {
  const parts = token.split(":");
  if (parts.length !== TOKEN_PARTS) {
    return undefined;
  }
  const [layer, frame] = parts;
  const value = Number(frame);
  if (!isPaintLayer(layer) || !Number.isInteger(value)) {
    return undefined;
  }
  return { frame: value, layer };
};

export type AutotileLookup = Map<string, Cell>;

export const autotileKey = (layer: AutotileLayer, mask: number): string => `${layer}:${mask}`;

export const buildAutotileLookup = (group: SubSpriteGroup | undefined): AutotileLookup => {
  const lookup: AutotileLookup = new Map();
  if (!group) {
    return lookup;
  }
  for (const cell of groupCells(group)) {
    if (cell.autotile) {
      lookup.set(autotileKey(cell.autotile.layer, cell.autotile.mask), {
        col: cell.col,
        row: cell.row,
      });
    }
  }
  return lookup;
};
