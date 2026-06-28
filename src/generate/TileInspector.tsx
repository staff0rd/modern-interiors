import type { AutotileTag } from "../metadata/schema.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";
import { groupCells, type Cell } from "../sheet/groupCells.ts";
import { AutotileForm } from "./AutotileForm.tsx";
import { columns, styles, swatchStyle } from "./generateStyles.ts";
import { cropStyle, sheetSize, wallGroup, withAutotile, type SheetSize } from "./tileSheet.ts";
import { GROUP_INDEX, GROUP_TILE_COLS, WALLS_PATH } from "./tileset.ts";

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
};

export const TileInspector = ({ store, selected, onSelect }: InspectorProps) => {
  const group = wallGroup(store.metadata);
  if (!group) {
    return <div style={styles.inspector}>Loading tiles…</div>;
  }
  const groups = store.metadata?.assets[WALLS_PATH]?.subSpriteGroups ?? [];
  const sheet = sheetSize(store.manifest);
  const cells = groupCells(group);
  const current = cells[selected] ?? cells[FIRST];
  const onAutotile = (tag: AutotileTag | null) =>
    store.setSubSpriteGroups(WALLS_PATH, withAutotile(groups, selected, tag));
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
      {current && <AutotileForm cell={current} sheet={sheet} onAutotile={onAutotile} />}
    </div>
  );
};
