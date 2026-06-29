import type { PaletteEntry } from "./palette.ts";
import { styles } from "./generateStyles.ts";
import { cropStyle } from "./tileSheet.ts";

const PREVIEW_SCALE = 12;
const CONFIRM_CLEAR = "Clear all painting? This cannot be undone.";

type PaintPanelProps = {
  entry: PaletteEntry;
  onClear: () => void;
};

export const PaintPanel = ({ entry, onClear }: PaintPanelProps) => {
  const confirmClear = () => {
    if (window.confirm(CONFIRM_CLEAR)) {
      onClear();
    }
  };
  return (
    <div style={styles.binding}>
      <div style={cropStyle(entry.rect, entry.image, PREVIEW_SCALE)} />
      <strong>{entry.name}</strong>
      <div style={styles.meta}>selected {entry.layer} tile</div>
      <div style={styles.meta}>
        Click any square on the map to paint just that square with this tile.
      </div>
      <button style={styles.button} onClick={confirmClear}>
        Clear all painting
      </button>
    </div>
  );
};
