import type { SubSpriteGroup } from "../metadata/schema.ts";
import { adjustNames, gridDims } from "./groupCells.ts";

const ONE = 1;
const ZERO = 0;

export type SheetSize = { width: number; height: number };

type TilePlan = {
  across: number;
  down: number;
  blockWidth: number;
  blockHeight: number;
  sourceIndex: number;
  keepSource: boolean;
  variantNames: string[];
};

const tilePlan = (source: SubSpriteGroup, sheet: SheetSize): TilePlan => {
  const { cols, rows } = gridDims(source);
  const blockWidth = cols * source.cellWidth;
  const blockHeight = rows * source.cellHeight;
  const across = Math.max(ONE, Math.floor(sheet.width / blockWidth));
  const down = Math.max(ONE, Math.floor(sheet.height / blockHeight));
  const sourceCol = Math.floor(source.rect.left / blockWidth);
  const sourceRow = Math.floor(source.rect.top / blockHeight);
  const keepSource = source.name.length > ZERO && sourceCol < across && sourceRow < down;
  return {
    across,
    blockHeight,
    blockWidth,
    down,
    keepSource,
    sourceIndex: sourceRow * across + sourceCol,
    variantNames: adjustNames(source.variantNames, cols * rows),
  };
};

const tileName = (isSource: boolean, source: SubSpriteGroup, placeholder: number): string => {
  if (isSource) {
    return source.name;
  }
  return `group-${placeholder}`;
};

const tileDescription = (isSource: boolean, source: SubSpriteGroup): string | undefined => {
  if (isSource) {
    return source.description;
  }
  return undefined;
};

const placeholderNumber = (index: number, plan: TilePlan): number => {
  if (plan.keepSource && index > plan.sourceIndex) {
    return index - ONE;
  }
  return index;
};

const tileBlock = (source: SubSpriteGroup, plan: TilePlan, index: number): SubSpriteGroup => {
  const col = index % plan.across;
  const row = Math.floor(index / plan.across);
  const isSource = plan.keepSource && index === plan.sourceIndex;
  return {
    cellHeight: source.cellHeight,
    cellWidth: source.cellWidth,
    description: tileDescription(isSource, source),
    name: tileName(isSource, source, placeholderNumber(index, plan)),
    rect: {
      height: plan.blockHeight,
      left: col * plan.blockWidth,
      top: row * plan.blockHeight,
      width: plan.blockWidth,
    },
    variantNames: [...plan.variantNames],
  };
};

export const tileGroups = (source: SubSpriteGroup, sheet: SheetSize): SubSpriteGroup[] => {
  const plan = tilePlan(source, sheet);
  const count = plan.across * plan.down;
  return Array.from({ length: count }, (_unused, index) => tileBlock(source, plan, index));
};
