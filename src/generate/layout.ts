import { bspRooms, type Footprint, type RoomRect } from "./bsp.ts";
import { classifyRegions, insetRoom, type Region, REGION_WALL } from "./regions.ts";
import { makeRng } from "./rng.ts";

const ZERO = 0;
const ONE = 1;

const MASK_N = 1;
const MASK_E = 2;
const MASK_S = 4;
const MASK_W = 8;
const MASK_NE = 16;
const MASK_SE = 32;
const MASK_SW = 64;
const MASK_NW = 128;

type Diagonal = { bit: number; dc: number; dr: number; flanks: number };

const DIAGONALS: Diagonal[] = [
  { bit: MASK_NE, dc: ONE, dr: -ONE, flanks: MASK_N | MASK_E },
  { bit: MASK_SE, dc: ONE, dr: ONE, flanks: MASK_S | MASK_E },
  { bit: MASK_SW, dc: -ONE, dr: ONE, flanks: MASK_S | MASK_W },
  { bit: MASK_NW, dc: -ONE, dr: -ONE, flanks: MASK_N | MASK_W },
];

export type Grid = {
  cols: number;
  rows: number;
  wall: boolean[];
  mask: number[];
  region: Region[];
  rooms: RoomRect[];
};

type Field = { wall: boolean[]; cols: number; rows: number };

const index = (cols: number, col: number, row: number): number => row * cols + col;

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
  const rooms = bspRooms(makeRng(seed), footprint).map(insetRoom);
  const region = classifyRegions(footprint, rooms);
  const wall = region.map((value) => value === REGION_WALL);
  const field: Field = { cols, rows, wall };
  const mask = wall.map((_unused, at) => cellMask(field, at));
  return { cols, mask, region, rooms, rows, wall };
};
