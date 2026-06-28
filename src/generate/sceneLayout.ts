import type Phaser from "phaser";

import type { Grid } from "./layout.ts";
import { TILE } from "./tileset.ts";

const ZERO = 0;
const HALF = 2;
const MIN_SCALE = 1;

export const WALL_MISS = -1;

export const fitScale = (size: Phaser.Structs.Size, width: number, height: number): number => {
  const fit = Math.min(size.width / width, size.height / height);
  return Math.max(MIN_SCALE, Math.floor(fit));
};

export const center = (viewport: number, content: number): number => (viewport - content) / HALF;

const colRowAt = (root: Phaser.GameObjects.Container, pointer: Phaser.Input.Pointer) => {
  const span = TILE * root.scaleX;
  return {
    col: Math.floor((pointer.x - root.x) / span),
    row: Math.floor((pointer.y - root.y) / span),
  };
};

const inBounds = (grid: Grid, col: number, row: number): boolean =>
  col >= ZERO && row >= ZERO && col < grid.cols && row < grid.rows;

export const wallCellAt = (
  root: Phaser.GameObjects.Container,
  grid: Grid,
  pointer: Phaser.Input.Pointer,
): number => {
  const { col, row } = colRowAt(root, pointer);
  if (!inBounds(grid, col, row)) {
    return WALL_MISS;
  }
  const at = row * grid.cols + col;
  if (!grid.wall[at]) {
    return WALL_MISS;
  }
  return at;
};
