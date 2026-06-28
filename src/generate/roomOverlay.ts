import type Phaser from "phaser";

import type { Grid } from "./layout.ts";
import { TILE } from "./tileset.ts";

const SOLID = 1;
const ROOM_ALPHA = 0.35;
const ROOM_BORDER = 2;
const BLUE = 0x5b8cff;
const ORANGE = 0xff8a5b;
const GREEN = 0x5bffa0;
const PINK = 0xff5bd0;
const YELLOW = 0xffd54a;
const PURPLE = 0x8a5bff;
const ROOM_COLORS = [BLUE, ORANGE, GREEN, PINK, YELLOW, PURPLE];

export const roomOverlay = (scene: Phaser.Scene, grid: Grid): Phaser.GameObjects.Graphics => {
  const graphics = scene.add.graphics();
  grid.rooms.forEach((room, index) => {
    const color = ROOM_COLORS[index % ROOM_COLORS.length] ?? BLUE;
    graphics.fillStyle(color, ROOM_ALPHA);
    graphics.lineStyle(ROOM_BORDER, color, SOLID);
    graphics.fillRect(room.left * TILE, room.top * TILE, room.width * TILE, room.height * TILE);
    graphics.strokeRect(room.left * TILE, room.top * TILE, room.width * TILE, room.height * TILE);
  });
  return graphics;
};
