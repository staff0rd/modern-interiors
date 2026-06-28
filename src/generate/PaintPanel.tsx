import type { Cell } from "../sheet/groupCells.ts";
import { styles } from "./generateStyles.ts";
import { cropStyle, type SheetSize } from "./tileSheet.ts";

const PREVIEW_SCALE = 6;

type PaintPanelProps = {
  cell: Cell;
  sheet: SheetSize;
  onClear: () => void;
};

export const PaintPanel = ({ cell, sheet, onClear }: PaintPanelProps) => (
  <div style={styles.binding}>
    <div style={cropStyle(cell.rect, sheet, PREVIEW_SCALE)} />
    <div style={styles.meta}>
      selected tile · cell {cell.col},{cell.row}
    </div>
    <div style={styles.meta}>
      Click any wall square on the map to paint just that square with this tile.
    </div>
    <button style={styles.button} onClick={onClear}>
      Clear all painting
    </button>
  </div>
);
