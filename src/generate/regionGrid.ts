import type { RoomRect } from "./bsp.ts";

const ZERO = 0;

export const REGION_OUTSIDE = 0;
export const REGION_WALL = 1;
export const REGION_INTERIOR = 2;
export const REGION_WALKWAY = 3;

export type Region =
  | typeof REGION_OUTSIDE
  | typeof REGION_WALL
  | typeof REGION_INTERIOR
  | typeof REGION_WALKWAY;

export type Canvas = { region: Region[]; cols: number; rows: number };
export type Cell = { col: number; row: number };

export const right = (room: RoomRect): number => room.left + room.width;
export const bottom = (room: RoomRect): number => room.top + room.height;

export const columnsOverlap = (roomA: RoomRect, roomB: RoomRect): boolean =>
  Math.max(roomA.left, roomB.left) < Math.min(right(roomA), right(roomB));

export const put = (canvas: Canvas, cell: Cell, region: Region): void => {
  if (cell.col < ZERO || cell.row < ZERO || cell.col >= canvas.cols || cell.row >= canvas.rows) {
    return;
  }
  canvas.region[cell.row * canvas.cols + cell.col] = region;
};

export const range = (start: number, count: number): number[] =>
  Array.from({ length: count }, (_unused, offset) => start + offset);
