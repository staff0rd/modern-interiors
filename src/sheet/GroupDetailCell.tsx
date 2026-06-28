import type { Cell } from "./groupCells.ts";
import { cellSelectedStyle, sheetStyles } from "./sheetStyles.ts";

type GroupDetailCellProps = {
  cell: Cell;
  zoom: number;
  cellWidth: number;
  cellHeight: number;
  selected: boolean;
  onSelect: (index: number) => void;
};

export const GroupDetailCell = ({
  cell,
  zoom,
  cellWidth,
  cellHeight,
  selected,
  onSelect,
}: GroupDetailCellProps) => (
  <div
    style={{
      ...sheetStyles.cell,
      ...cellSelectedStyle(selected),
      height: cellHeight * zoom,
      left: cell.col * cellWidth * zoom,
      top: cell.row * cellHeight * zoom,
      width: cellWidth * zoom,
    }}
    onClick={() => onSelect(cell.index)}
  >
    <span style={sheetStyles.cellLabel}>{cell.name || cell.index}</span>
  </div>
);
