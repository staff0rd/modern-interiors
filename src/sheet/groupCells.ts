import type { ManifestEntry, SubSpriteGroup } from "../metadata/schema.ts";
import type { Rect } from "./useSheetEditor.ts";

const ONE = 1;
const ZERO = 0;
const FALLBACK_CELL = 16;

export type Cell = { col: number; index: number; name: string; rect: Rect; row: number };

export const gridDims = (group: SubSpriteGroup): { cols: number; rows: number } => ({
  cols: Math.max(ONE, Math.floor(group.rect.width / group.cellWidth)),
  rows: Math.max(ONE, Math.floor(group.rect.height / group.cellHeight)),
});

export const cellCount = (group: SubSpriteGroup): number => {
  const { cols, rows } = gridDims(group);
  return cols * rows;
};

export const groupCells = (group: SubSpriteGroup): Cell[] => {
  const { cols, rows } = gridDims(group);
  const cells: Cell[] = [];
  for (let row = ZERO; row < rows; row += ONE) {
    for (let col = ZERO; col < cols; col += ONE) {
      const index = row * cols + col;
      cells.push({
        col,
        index,
        name: group.variantNames[index] ?? "",
        rect: {
          height: group.cellHeight,
          left: group.rect.left + col * group.cellWidth,
          top: group.rect.top + row * group.cellHeight,
          width: group.cellWidth,
        },
        row,
      });
    }
  }
  return cells;
};

export const adjustNames = (names: string[], count: number): string[] =>
  Array.from({ length: count }, (_unused, index) => names[index] ?? "");

export const snapRect = (rect: Rect, cellWidth: number, cellHeight: number): Rect => ({
  height: Math.max(cellHeight, Math.round(rect.height / cellHeight) * cellHeight),
  left: Math.floor(rect.left / cellWidth) * cellWidth,
  top: Math.floor(rect.top / cellHeight) * cellHeight,
  width: Math.max(cellWidth, Math.round(rect.width / cellWidth) * cellWidth),
});

export const defaultCellSize = (entry: ManifestEntry | undefined): number =>
  entry?.frameWidth ?? FALLBACK_CELL;
