import type { Footprint, RoomRect } from "./bsp.ts";

const ONE = 1;
const TWO = 2;
const GAP = 1;

const REGION_OUTSIDE = 0;
export const REGION_WALL = 1;
export const REGION_INTERIOR = 2;
export const REGION_WALKWAY = 3;

export type Region =
  | typeof REGION_OUTSIDE
  | typeof REGION_WALL
  | typeof REGION_INTERIOR
  | typeof REGION_WALKWAY;

type Point = { col: number; row: number };

type Canvas = { region: Region[]; cols: number };

export const insetRoom = (room: RoomRect): RoomRect => ({
  height: room.height - GAP * TWO,
  left: room.left + GAP,
  top: room.top + GAP,
  width: room.width - GAP * TWO,
});

const roomCenter = (room: RoomRect): Point => ({
  col: room.left + Math.floor(room.width / TWO),
  row: room.top + Math.floor(room.height / TWO),
});

const isEdge = (room: RoomRect, col: number, row: number): boolean =>
  row === room.top ||
  row === room.top + room.height - ONE ||
  col === room.left ||
  col === room.left + room.width - ONE;

const paintRoom = (canvas: Canvas, room: RoomRect): void => {
  for (let row = room.top; row < room.top + room.height; row += ONE) {
    for (let col = room.left; col < room.left + room.width; col += ONE) {
      const at = row * canvas.cols + col;
      if (isEdge(room, col, row)) {
        canvas.region[at] = REGION_WALL;
      } else {
        canvas.region[at] = REGION_INTERIOR;
      }
    }
  }
};

const carveWalkway = (canvas: Canvas, col: number, row: number): void => {
  const at = row * canvas.cols + col;
  if (canvas.region[at] === REGION_OUTSIDE) {
    canvas.region[at] = REGION_WALKWAY;
  }
};

const carveCorridor = (canvas: Canvas, from: Point, to: Point): void => {
  for (let col = Math.min(from.col, to.col); col <= Math.max(from.col, to.col); col += ONE) {
    carveWalkway(canvas, col, from.row);
  }
  for (let row = Math.min(from.row, to.row); row <= Math.max(from.row, to.row); row += ONE) {
    carveWalkway(canvas, to.col, row);
  }
};

const connectRooms = (canvas: Canvas, rooms: RoomRect[]): void => {
  const centers = rooms.map(roomCenter);
  centers.forEach((to, order) => {
    const from = centers[order - ONE];
    if (from) {
      carveCorridor(canvas, from, to);
    }
  });
};

export const classifyRegions = (footprint: Footprint, rooms: RoomRect[]): Region[] => {
  const canvas: Canvas = {
    cols: footprint.cols,
    region: new Array<Region>(footprint.cols * footprint.rows).fill(REGION_OUTSIDE),
  };
  for (const room of rooms) {
    paintRoom(canvas, room);
  }
  connectRooms(canvas, rooms);
  return canvas.region;
};
