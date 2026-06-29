import type { Footprint, RoomRect } from "./bsp.ts";
import { connectRooms } from "./connectRooms.ts";
import {
  bottom,
  type Canvas,
  columnsOverlap,
  put,
  REGION_INTERIOR,
  REGION_OUTSIDE,
  REGION_WALL,
  type Region,
  right,
} from "./regionGrid.ts";

const ZERO = 0;
const ONE = 1;
const TOP_WALL = 3;
const BASEBOARD = 1;
const SIDE_WALL = 1;

const hasRoomBelow = (room: RoomRect, rooms: RoomRect[]): boolean =>
  rooms.some(
    (other) => other !== room && other.top === bottom(room) && columnsOverlap(room, other),
  );

const bottomThickness = (room: RoomRect, rooms: RoomRect[]): number => {
  if (hasRoomBelow(room, rooms)) {
    return ZERO;
  }
  return BASEBOARD;
};

const wallOrInterior = (onWall: boolean): Region => {
  if (onWall) {
    return REGION_WALL;
  }
  return REGION_INTERIOR;
};

const paintRoom = (canvas: Canvas, room: RoomRect, rooms: RoomRect[]): void => {
  const topEnd = room.top + TOP_WALL;
  const bottomStart = bottom(room) - bottomThickness(room, rooms);
  for (let row = room.top; row < bottom(room); row += ONE) {
    for (let col = room.left; col < right(room); col += ONE) {
      const onWall =
        row < topEnd ||
        row >= bottomStart ||
        col < room.left + SIDE_WALL ||
        col >= right(room) - SIDE_WALL;
      put(canvas, { col, row }, wallOrInterior(onWall));
    }
  }
};

export const classifyRegions = (footprint: Footprint, rooms: RoomRect[]): Region[] => {
  const canvas: Canvas = {
    cols: footprint.cols,
    region: new Array<Region>(footprint.cols * footprint.rows).fill(REGION_OUTSIDE),
    rows: footprint.rows,
  };
  for (const room of rooms) {
    paintRoom(canvas, room, rooms);
  }
  connectRooms(canvas, rooms);
  return canvas.region;
};
