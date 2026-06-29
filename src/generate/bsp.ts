import type { Rng } from "./rng.ts";

export type RoomRect = { left: number; top: number; width: number; height: number };

export type Footprint = { cols: number; rows: number };

const ZERO = 0;
const ONE = 1;
const TWO = 2;
const MIN_ROOM = 9;
const DOUBLE_WALL_SPAN = MIN_ROOM * TWO;
const MAX_DEPTH = 4;
const ASPECT_BIAS = 1.25;
const EVEN_CHANCE = 0.5;

type Partition = { rng: Rng; out: RoomRect[] };

const splitAt = (rng: Rng, length: number, span: number): number =>
  MIN_ROOM + rng.int(length - span + ONE);

const splitVertical = (room: RoomRect, at: number): [RoomRect, RoomRect] => [
  { height: room.height, left: room.left, top: room.top, width: at },
  { height: room.height, left: room.left + at, top: room.top, width: room.width - at },
];

const splitHorizontal = (room: RoomRect, at: number): [RoomRect, RoomRect] => [
  { height: at, left: room.left, top: room.top, width: room.width },
  { height: room.height - at, left: room.left, top: room.top + at, width: room.width },
];

const canSplitVertical = (room: RoomRect): boolean => room.width >= DOUBLE_WALL_SPAN;
const canSplitHorizontal = (room: RoomRect): boolean => room.height >= DOUBLE_WALL_SPAN;

const chooseVertical = (rng: Rng, room: RoomRect): boolean => {
  if (canSplitVertical(room) && canSplitHorizontal(room)) {
    if (room.width > room.height * ASPECT_BIAS) {
      return true;
    }
    if (room.height > room.width * ASPECT_BIAS) {
      return false;
    }
    return rng.next() < EVEN_CHANCE;
  }
  return canSplitVertical(room);
};

const split = (rng: Rng, room: RoomRect): [RoomRect, RoomRect] | null => {
  if (!canSplitVertical(room) && !canSplitHorizontal(room)) {
    return null;
  }
  if (chooseVertical(rng, room)) {
    return splitVertical(room, splitAt(rng, room.width, DOUBLE_WALL_SPAN));
  }
  return splitHorizontal(room, splitAt(rng, room.height, DOUBLE_WALL_SPAN));
};

const splitAtDepth = (rng: Rng, room: RoomRect, depth: number): [RoomRect, RoomRect] | null => {
  if (depth >= MAX_DEPTH) {
    return null;
  }
  return split(rng, room);
};

const partition = (context: Partition, room: RoomRect, depth: number): void => {
  const children = splitAtDepth(context.rng, room, depth);
  if (!children) {
    context.out.push(room);
    return;
  }
  for (const child of children) {
    partition(context, child, depth + ONE);
  }
};

export const bspRooms = (rng: Rng, footprint: Footprint): RoomRect[] => {
  const context: Partition = { out: [], rng };
  const whole: RoomRect = { height: footprint.rows, left: ZERO, top: ZERO, width: footprint.cols };
  partition(context, whole, ZERO);
  return context.out;
};
