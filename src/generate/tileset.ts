import type { AutotileLayer, SubSpriteGroup } from "../metadata/schema.ts";
import { groupCells } from "../sheet/groupCells.ts";

const PACK = "/moderninteriors-win/1_Interiors/16x16/Room_Builder_subfiles";

export const TILE = 16;
export const WALLS_KEY = "rb-3d-walls";
export const FLOORS_KEY = "rb-floors";
const WALLS_NAME = "Room_Builder_3d_walls_16x16.png";
export const WALLS_PATH = `1_Interiors/16x16/Room_Builder_subfiles/${WALLS_NAME}`;
export const WALLS_URL = `/moderninteriors-win/${WALLS_PATH}`;
export const FLOORS_URL = `${PACK}/Room_Builder_Floors_16x16.png`;
export const GROUP_INDEX = 14;

const WALLS_COLS = 24;
const FLOORS_COLS = 15;

const GROUP_COL = 16;
const GROUP_ROW = 28;
export const GROUP_TILE_COLS = 8;

export type Cell = { col: number; row: number };

export const wallFrame = (cell: Cell): number =>
  (GROUP_ROW + cell.row) * WALLS_COLS + (GROUP_COL + cell.col);

const FLOOR_COL = 5;
const FLOOR_ROW = 3;

const floorFrame = (col: number, row: number): number => row * FLOORS_COLS + col;

export const FLOOR_CELL = floorFrame(FLOOR_COL, FLOOR_ROW);

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
