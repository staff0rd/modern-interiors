import { AUTOTILE_LAYER_VALUES, type AutotileLayer, type AutotileTag } from "../metadata/schema.ts";
import type { Cell } from "../sheet/groupCells.ts";
import { styles } from "./generateStyles.ts";
import {
  MASK_E,
  MASK_N,
  MASK_NE,
  MASK_NW,
  MASK_S,
  MASK_SE,
  MASK_SW,
  MASK_W,
  normalizeMask,
} from "./layout.ts";
import { cropStyle, type SheetSize } from "./tileSheet.ts";

const CENTRE_SCALE = 6;
const NO_MASK = 0;
const UNTAGGED = "";
const DEFAULT_LAYER: AutotileLayer = "wall";

type Neighbour = { bit: number; flanks: number; label: string };

const NEIGHBOURS: (Neighbour | null)[] = [
  { bit: MASK_NW, flanks: MASK_N | MASK_W, label: "NW" },
  { bit: MASK_N, flanks: NO_MASK, label: "N" },
  { bit: MASK_NE, flanks: MASK_N | MASK_E, label: "NE" },
  { bit: MASK_W, flanks: NO_MASK, label: "W" },
  null,
  { bit: MASK_E, flanks: NO_MASK, label: "E" },
  { bit: MASK_SW, flanks: MASK_S | MASK_W, label: "SW" },
  { bit: MASK_S, flanks: NO_MASK, label: "S" },
  { bit: MASK_SE, flanks: MASK_S | MASK_E, label: "SE" },
];

type BoxProps = { neighbour: Neighbour; mask: number; onToggle: (bit: number) => void };

const NeighbourBox = ({ neighbour, mask, onToggle }: BoxProps) => {
  const locked = neighbour.flanks !== NO_MASK && (mask & neighbour.flanks) !== neighbour.flanks;
  return (
    <label style={styles.neighbour}>
      <input
        type="checkbox"
        disabled={locked}
        checked={(mask & neighbour.bit) !== NO_MASK}
        onChange={() => onToggle(neighbour.bit)}
      />
      {neighbour.label}
    </label>
  );
};

type AutotileFormProps = {
  cell: Cell;
  sheet: SheetSize;
  onAutotile: (tag: AutotileTag | null) => void;
};

export const AutotileForm = ({ cell, sheet, onAutotile }: AutotileFormProps) => {
  const tag = cell.autotile;
  const layer = tag?.layer ?? UNTAGGED;
  const mask = tag?.mask ?? NO_MASK;
  const setLayer = (value: string) => {
    if (value === UNTAGGED) {
      onAutotile(null);
      return;
    }
    onAutotile({ layer: value as AutotileLayer, mask });
  };
  const toggle = (bit: number) =>
    onAutotile({ layer: tag?.layer ?? DEFAULT_LAYER, mask: normalizeMask(mask ^ bit) });
  const renderSlot = (slot: Neighbour | null) => {
    if (!slot) {
      return <div key="centre" style={cropStyle(cell.rect, sheet, CENTRE_SCALE)} />;
    }
    return <NeighbourBox key={slot.label} neighbour={slot} mask={mask} onToggle={toggle} />;
  };
  return (
    <>
      <div style={styles.meta}>
        cell {cell.col},{cell.row} · index {cell.index} · mask {mask}
      </div>
      <label>
        layer
        <select
          style={styles.tagInput}
          value={layer}
          onChange={(event) => setLayer(event.target.value)}
        >
          <option value={UNTAGGED}>untagged</option>
          {AUTOTILE_LAYER_VALUES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <div style={styles.neighbours}>{NEIGHBOURS.map(renderSlot)}</div>
    </>
  );
};
