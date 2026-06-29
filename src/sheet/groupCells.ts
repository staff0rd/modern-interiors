import type { AutotileTag, ManifestEntry, Rect, SubSpriteGroup } from "../metadata/schema.ts";

const ONE = 1;
const ZERO = 0;
const FALLBACK_CELL = 16;

export type Cell = {
  autotile: AutotileTag | null;
  col: number;
  index: number;
  name: string;
  rect: Rect;
  row: number;
};

export const gridDims = (group: SubSpriteGroup): { cols: number; rows: number } => ({
  cols: Math.max(ONE, Math.floor(group.rect.width / group.cellWidth)),
  rows: Math.max(ONE, Math.floor(group.rect.height / group.cellHeight)),
});

const gridPositions = (cols: number, rows: number): { col: number; row: number }[] => {
  const all: { col: number; row: number }[] = [];
  for (let row = ZERO; row < rows; row += ONE) {
    for (let col = ZERO; col < cols; col += ONE) {
      all.push({ col, row });
    }
  }
  return all;
};

const positions = (group: SubSpriteGroup): { col: number; row: number }[] => {
  if (group.cells) {
    return group.cells;
  }
  const { cols, rows } = gridDims(group);
  return gridPositions(cols, rows);
};

export const cellCount = (group: SubSpriteGroup): number => positions(group).length;

export const groupCells = (group: SubSpriteGroup): Cell[] =>
  positions(group).map(({ col, row }, index) => ({
    autotile: group.autotiles?.[index] ?? null,
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
  }));

export type CellSignatures = Map<string, string>;
export type CellGrid = { rect: Rect; cellWidth: number; cellHeight: number };

export const occupancyKey = (col: number, row: number): string => `${col},${row}`;

export const occupiedInRect = (
  signatures: CellSignatures | null,
  { rect, cellWidth, cellHeight }: CellGrid,
): { col: number; row: number }[] | undefined => {
  if (!signatures) {
    return undefined;
  }
  const cols = Math.max(ONE, Math.floor(rect.width / cellWidth));
  const rows = Math.max(ONE, Math.floor(rect.height / cellHeight));
  const baseCol = Math.floor(rect.left / cellWidth);
  const baseRow = Math.floor(rect.top / cellHeight);
  const seen = new Set<string>();
  return gridPositions(cols, rows).filter(({ col, row }) => {
    const signature = signatures.get(occupancyKey(baseCol + col, baseRow + row));
    if (signature === undefined || seen.has(signature)) {
      return false;
    }
    seen.add(signature);
    return true;
  });
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
