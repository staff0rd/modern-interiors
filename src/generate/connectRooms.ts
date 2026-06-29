import type { RoomRect } from "./bsp.ts";
import {
  bottom,
  type Canvas,
  columnsOverlap,
  put,
  range,
  REGION_WALKWAY,
  right,
} from "./regionGrid.ts";

const TWO = 2;
const TOP_WALL = 3;
const SIDE_WALL = 1;
const DOOR = 2;
const WALKWAY = 3;

const overlaps = (roomA: RoomRect, roomB: RoomRect): boolean =>
  columnsOverlap(roomA, roomB) &&
  Math.max(roomA.top, roomB.top) < Math.min(bottom(roomA), bottom(roomB));

const doorStart = (lo: number, hi: number, span: number): number | null => {
  const available = hi - lo;
  if (available < span + TWO) {
    return null;
  }
  return lo + Math.floor((available - span) / TWO);
};

const carveBetween = (canvas: Canvas, cols: number[], rows: number[]): void => {
  for (const col of cols) {
    for (const row of rows) {
      put(canvas, { col, row }, REGION_WALKWAY);
    }
  }
};

const verticalDoor = (canvas: Canvas, upper: RoomRect, lower: RoomRect): boolean => {
  const start = doorStart(
    Math.max(upper.left, lower.left),
    Math.min(right(upper), right(lower)),
    DOOR,
  );
  if (start === null) {
    return false;
  }
  carveBetween(canvas, range(start, DOOR), range(lower.top, TOP_WALL));
  return true;
};

const horizontalDoor = (canvas: Canvas, leftRoom: RoomRect, rightRoom: RoomRect): boolean => {
  const start = Math.max(leftRoom.top, rightRoom.top) + TOP_WALL;
  const bottomMin = Math.min(bottom(leftRoom), bottom(rightRoom));
  if (start + DOOR > bottomMin) {
    return false;
  }
  carveBetween(canvas, range(right(leftRoom) - SIDE_WALL, WALKWAY), range(start, DOOR));
  return true;
};

const doorway = (canvas: Canvas, roomA: RoomRect, roomB: RoomRect): boolean => {
  if (bottom(roomA) === roomB.top) {
    return verticalDoor(canvas, roomA, roomB);
  }
  if (bottom(roomB) === roomA.top) {
    return verticalDoor(canvas, roomB, roomA);
  }
  if (right(roomA) === roomB.left) {
    return horizontalDoor(canvas, roomA, roomB);
  }
  if (right(roomB) === roomA.left) {
    return horizontalDoor(canvas, roomB, roomA);
  }
  return false;
};

const find = (parent: number[], node: number): number => {
  let root = node;
  while (parent[root] !== root) {
    parent[root] = parent[parent[root]] ?? root;
    root = parent[root];
  }
  return root;
};

export const connectRooms = (canvas: Canvas, rooms: RoomRect[]): void => {
  const parent = rooms.map((_room, index) => index);
  rooms.forEach((roomA, indexA) => {
    rooms.forEach((roomB, indexB) => {
      if (
        indexB <= indexA ||
        find(parent, indexA) === find(parent, indexB) ||
        overlaps(roomA, roomB)
      ) {
        return;
      }
      if (doorway(canvas, roomA, roomB)) {
        parent[find(parent, indexA)] = find(parent, indexB);
      }
    });
  });
};
