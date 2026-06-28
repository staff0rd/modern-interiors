import type { MetadataStore } from "../metadata/useMetadata.ts";
import { groupCells, type Cell } from "../sheet/groupCells.ts";
import { PaintPanel } from "./PaintPanel.tsx";
import { columns, styles, swatchStyle } from "./generateStyles.ts";
import { cropStyle, sheetSize, wallGroup, type SheetSize } from "./tileSheet.ts";
import { GROUP_INDEX, GROUP_TILE_COLS } from "./tileset.ts";

const FIRST = 0;
const PALETTE_SCALE = 3;

type SwatchProps = {
  cell: Cell;
  sheet: SheetSize;
  active: boolean;
  onSelect: (index: number) => void;
};

const Swatch = ({ cell, sheet, active, onSelect }: SwatchProps) => (
  <button
    style={swatchStyle(active)}
    onClick={() => onSelect(cell.index)}
    title={`${cell.col},${cell.row}`}
  >
    <div style={cropStyle(cell.rect, sheet, PALETTE_SCALE)} />
  </button>
);

type InspectorProps = {
  store: MetadataStore;
  selected: number;
  onSelect: (index: number) => void;
  onClear: () => void;
};

export const TileInspector = ({ store, selected, onSelect, onClear }: InspectorProps) => {
  const group = wallGroup(store.metadata);
  if (!group) {
    return <div style={styles.inspector}>Loading tiles…</div>;
  }
  const sheet = sheetSize(store.manifest);
  const cells = groupCells(group);
  const current = cells[selected] ?? cells[FIRST];
  return (
    <div style={styles.inspector}>
      <strong>group-{GROUP_INDEX} tiles</strong>
      <div style={columns(GROUP_TILE_COLS)}>
        {cells.map((cell) => (
          <Swatch
            key={cell.index}
            cell={cell}
            sheet={sheet}
            active={cell.index === selected}
            onSelect={onSelect}
          />
        ))}
      </div>
      {current && <PaintPanel cell={current} sheet={sheet} onClear={onClear} />}
    </div>
  );
};
