import type { SubSpriteGroup } from "../metadata/schema.ts";
import { adjustNames, gridDims } from "./groupCells.ts";

const ONE = 1;

export type SheetSize = { width: number; height: number };

type Block = { width: number; height: number };
type Position = { left: number; top: number };
type Tiling = { source: SubSpriteGroup; block: Block; colsPerRow: number; wrapLeft: number };

const blockOf = (source: SubSpriteGroup): Block => {
  const { cols, rows } = gridDims(source);
  return { height: rows * source.cellHeight, width: cols * source.cellWidth };
};

const tilingOf = (source: SubSpriteGroup, sheet: SheetSize): Tiling => {
  const block = blockOf(source);
  const wrapLeft = source.rect.left % block.width;
  const colsPerRow = Math.max(ONE, Math.floor((sheet.width - wrapLeft) / block.width));
  return { block, colsPerRow, source, wrapLeft };
};

const positionAt = (tiling: Tiling, slot: number): Position => ({
  left: tiling.wrapLeft + (slot % tiling.colsPerRow) * tiling.block.width,
  top: tiling.source.rect.top + Math.floor(slot / tiling.colsPerRow) * tiling.block.height,
});

const blockAt = (source: SubSpriteGroup, block: Block, position: Position): SubSpriteGroup => {
  const { cols, rows } = gridDims(source);
  return {
    cellHeight: source.cellHeight,
    cellWidth: source.cellWidth,
    description: undefined,
    name: "",
    rect: { height: block.height, left: position.left, top: position.top, width: block.width },
    variantNames: adjustNames(source.variantNames, cols * rows),
  };
};

export const remainingTileCount = (source: SubSpriteGroup, sheet: SheetSize): number => {
  const { block, colsPerRow, wrapLeft } = tilingOf(source, sheet);
  const sourceCol = (source.rect.left - wrapLeft) / block.width;
  const rows = Math.max(ONE, Math.floor((sheet.height - source.rect.top) / block.height));
  return Math.max(ONE, colsPerRow - ONE - sourceCol + (rows - ONE) * colsPerRow);
};

export const tileGroups = (
  source: SubSpriteGroup,
  sheet: SheetSize,
  count: number,
): SubSpriteGroup[] => {
  const tiling = tilingOf(source, sheet);
  const startSlot = (source.rect.left - tiling.wrapLeft) / tiling.block.width + ONE;
  const safeCount = Math.max(ONE, Math.floor(count));
  return Array.from({ length: safeCount }, (_unused, index) =>
    positionAt(tiling, startSlot + index),
  )
    .filter((position) => position.top + tiling.block.height <= sheet.height)
    .map((position) => blockAt(source, tiling.block, position));
};
