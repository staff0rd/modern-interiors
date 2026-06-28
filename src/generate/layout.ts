import { bspRooms, type Footprint, type RoomRect } from "./bsp.ts";
import { makeRng } from "./rng.ts";

const ZERO = 0;
const ONE = 1;

export const MASK_N = 1;
export const MASK_E = 2;
export const MASK_S = 4;
export const MASK_W = 8;
export const MASK_NE = 16;
export const MASK_SE = 32;
export const MASK_SW = 64;
export const MASK_NW = 128;

type Diagonal = { bit: number; dc: number; dr: number; flanks: number };

const DIAGONALS: Diagonal[] = [
  { bit: MASK_NE, dc: ONE, dr: -ONE, flanks: MASK_N | MASK_E },
  { bit: MASK_SE, dc: ONE, dr: ONE, flanks: MASK_S | MASK_E },
  { bit: MASK_SW, dc: -ONE, dr: ONE, flanks: MASK_S | MASK_W },
  { bit: MASK_NW, dc: -ONE, dr: -ONE, flanks: MASK_N | MASK_W },
];

export const normalizeMask = (mask: number): number => {
  let result = mask & (MASK_N | MASK_E | MASK_S | MASK_W);
  for (const diagonal of DIAGONALS) {
    if ((mask & diagonal.bit) !== ZERO && (mask & diagonal.flanks) === diagonal.flanks) {
      result |= diagonal.bit;
    }
  }
  return result;
};

export type Grid = {
  cols: number;
  rows: number;
  wall: boolean[];
  mask: number[];
  rooms: RoomRect[];
};

type Field = { wall: boolean[]; cols: number; rows: number };

const index = (cols: number, col: number, row: number): number => row * cols + col;

const carveFloors = (wall: boolean[], cols: number, rooms: RoomRect[]): void => {
  for (const room of rooms) {
    for (let row = room.top + ONE; row < room.top + room.height - ONE; row += ONE) {
      for (let col = room.left + ONE; col < room.left + room.width - ONE; col += ONE) {
        wall[index(cols, col, row)] = false;
      }
    }
  }
};

const isWall = (field: Field, col: number, row: number): boolean => {
  if (col < ZERO || row < ZERO || col >= field.cols || row >= field.rows) {
    return false;
  }
  return field.wall[index(field.cols, col, row)] ?? false;
};

const orthoMask = (field: Field, col: number, row: number): number => {
  let mask = ZERO;
  if (isWall(field, col, row - ONE)) {
    mask |= MASK_N;
  }
  if (isWall(field, col + ONE, row)) {
    mask |= MASK_E;
  }
  if (isWall(field, col, row + ONE)) {
    mask |= MASK_S;
  }
  if (isWall(field, col - ONE, row)) {
    mask |= MASK_W;
  }
  return mask;
};

const maskAt = (field: Field, col: number, row: number): number => {
  const ortho = orthoMask(field, col, row);
  let mask = ortho;
  for (const diagonal of DIAGONALS) {
    if (
      (ortho & diagonal.flanks) === diagonal.flanks &&
      isWall(field, col + diagonal.dc, row + diagonal.dr)
    ) {
      mask |= diagonal.bit;
    }
  }
  return mask;
};

const cellMask = (field: Field, at: number): number => {
  if (!field.wall[at]) {
    return ZERO;
  }
  return maskAt(field, at % field.cols, Math.floor(at / field.cols));
};

export const buildGrid = (seed: number, footprint: Footprint): Grid => {
  const { cols, rows } = footprint;
  const rooms = bspRooms(makeRng(seed), footprint);
  const wall = new Array<boolean>(cols * rows).fill(true);
  carveFloors(wall, cols, rooms);
  const field: Field = { cols, rows, wall };
  const mask = wall.map((_unused, at) => cellMask(field, at));
  return { cols, mask, rooms, rows, wall };
};
