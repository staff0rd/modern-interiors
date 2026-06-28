import { useState, type CSSProperties } from "react";

import { NumberField } from "../anim/NumberField.tsx";
import type { SubSpriteGroup } from "../metadata/schema.ts";
import { cellCount } from "./groupCells.ts";
import { remainingTileCount, type SheetSize } from "./groupTiling.ts";
import { sheetStyles } from "./sheetStyles.ts";

const COUNT_FIELD_WIDTH = 48;
const MIN_COUNT = 1;

const rowStyle = (active: boolean): CSSProperties => {
  if (active) {
    return { ...sheetStyles.row, ...sheetStyles.rowActive };
  }
  return sheetStyles.row;
};

const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

type GroupRowProps = {
  group: SubSpriteGroup;
  sheet: SheetSize;
  active: boolean;
  canTile: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onTile: (count: number) => void;
};

export const GroupRow = ({
  group,
  sheet,
  active,
  canTile,
  onSelect,
  onRemove,
  onTile,
}: GroupRowProps) => {
  const [count, setCount] = useState(() => remainingTileCount(group, sheet));
  return (
    <div style={rowStyle(active)} onClick={onSelect}>
      <span style={sheetStyles.rowName}>{group.name || "(unnamed)"}</span>
      <span style={sheetStyles.rowSummary}>{cellCount(group)} cells</span>
      {canTile && (
        <>
          <span style={sheetStyles.rowCount} onClick={stop}>
            <NumberField
              label="Count"
              value={count}
              width={COUNT_FIELD_WIDTH}
              min={MIN_COUNT}
              onChange={setCount}
            />
          </span>
          <button
            type="button"
            style={sheetStyles.rowAction}
            title="Tile this block the requested number of times, wrapping at the sheet edge"
            onClick={(event) => {
              stop(event);
              onTile(count);
            }}
          >
            ⧉ Tile
          </button>
        </>
      )}
      <button
        type="button"
        style={sheetStyles.removeButton}
        onClick={(event) => {
          stop(event);
          onRemove();
        }}
      >
        ✕
      </button>
    </div>
  );
};
