import type { Grid } from "./layout.ts";
import {
  autotileKey,
  type AutotileLookup,
  FLOORS_ONLY_KEY,
  type PaintLayer,
  type PaintMap,
  parsePaintToken,
  WALL_LAYER,
  wallFrame,
  WALLS_KEY,
} from "./tileset.ts";

const ZERO = 0;
const LAYER_KEY: Record<PaintLayer, string> = { floor: FLOORS_ONLY_KEY, wall: WALLS_KEY };

export type TileContext = { paint: PaintMap; lookup: AutotileLookup };
export type Placement = { key: string; frame: number };

const paintPlacement = (paint: PaintMap, at: number): Placement | null => {
  const token = paint[at];
  if (token === undefined) {
    return null;
  }
  const tile = parsePaintToken(token);
  if (!tile) {
    return null;
  }
  return { frame: tile.frame, key: LAYER_KEY[tile.layer] };
};

export const cellTile = (context: TileContext, grid: Grid, at: number): Placement | null => {
  const painted = paintPlacement(context.paint, at);
  if (painted) {
    return painted;
  }
  if (!grid.wall[at]) {
    return null;
  }
  const cell = context.lookup.get(autotileKey(WALL_LAYER, grid.mask[at] ?? ZERO));
  if (cell) {
    return { frame: wallFrame(cell), key: WALLS_KEY };
  }
  return null;
};
