import type { SubSpriteGroup } from "../metadata/schema.ts";
import { adjustNames, gridDims } from "./groupCells.ts";

const ONE = 1;

export type SheetSize = { width: number; height: number };

type BlockGrid = { across: number; down: number; blockWidth: number; blockHeight: number };

const blockGrid = (source: SubSpriteGroup, sheet: SheetSize): BlockGrid => {
  const { cols, rows } = gridDims(source);
  const blockWidth = cols * source.cellWidth;
  const blockHeight = rows * source.cellHeight;
  return {
    across: Math.max(ONE, Math.floor(sheet.width / blockWidth)),
    blockHeight,
    blockWidth,
    down: Math.max(ONE, Math.floor(sheet.height / blockHeight)),
  };
};

const sourceSlot = (source: SubSpriteGroup, grid: BlockGrid): number => {
  const col = Math.floor(source.rect.left / grid.blockWidth);
  const row = Math.floor(source.rect.top / grid.blockHeight);
  return row * grid.across + col;
};

const tileBlock = (source: SubSpriteGroup, grid: BlockGrid, slot: number): SubSpriteGroup => {
  const col = slot % grid.across;
  const row = Math.floor(slot / grid.across);
  const { cols, rows } = gridDims(source);
  return {
    cellHeight: source.cellHeight,
    cellWidth: source.cellWidth,
    description: undefined,
    name: `group-${slot}`,
    rect: {
      height: grid.blockHeight,
      left: col * grid.blockWidth,
      top: row * grid.blockHeight,
      width: grid.blockWidth,
    },
    variantNames: adjustNames(source.variantNames, cols * rows),
  };
};

export const remainingTileCount = (source: SubSpriteGroup, sheet: SheetSize): number => {
  const grid = blockGrid(source, sheet);
  return Math.max(ONE, grid.across * grid.down - sourceSlot(source, grid) - ONE);
};

export const tileGroups = (
  source: SubSpriteGroup,
  sheet: SheetSize,
  count: number,
): SubSpriteGroup[] => {
  const safeCount = Math.max(ONE, Math.floor(count));
  const grid = blockGrid(source, sheet);
  const start = sourceSlot(source, grid) + ONE;
  return Array.from({ length: safeCount }, (_unused, index) =>
    tileBlock(source, grid, start + index),
  );
};
