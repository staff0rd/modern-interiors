import type Phaser from "phaser";

import type { Grid } from "./layout.ts";
import { REGION_INTERIOR, REGION_WALKWAY, REGION_WALL, type Region } from "./regions.ts";
import { TILE } from "./tileset.ts";

const FILL_ALPHA = 0.4;
const INTERIOR_COLOR = 0x5b8cff;
const WALL_COLOR = 0xff8a5b;
const WALKWAY_COLOR = 0x5bffa0;

const REGION_COLOR = new Map<Region, number>([
  [REGION_INTERIOR, INTERIOR_COLOR],
  [REGION_WALL, WALL_COLOR],
  [REGION_WALKWAY, WALKWAY_COLOR],
]);

export const roomOverlay = (scene: Phaser.Scene, grid: Grid): Phaser.GameObjects.Graphics => {
  const graphics = scene.add.graphics();
  grid.region.forEach((region, at) => {
    const color = REGION_COLOR.get(region);
    if (color === undefined) {
      return;
    }
    graphics.fillStyle(color, FILL_ALPHA);
    graphics.fillRect((at % grid.cols) * TILE, Math.floor(at / grid.cols) * TILE, TILE, TILE);
  });
  return graphics;
};
