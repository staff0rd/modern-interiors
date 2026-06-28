import { useState, type CSSProperties } from "react";

import { NumberField } from "../anim/NumberField.tsx";
import type { SubSpriteGroup } from "../metadata/schema.ts";
import { cellCount } from "./groupCells.ts";
import { fullSheetTileCount, type SheetSize } from "./groupTiling.ts";
import { sheetStyles } from "./sheetStyles.ts";

const rowStyle = (active: boolean): CSSProperties => {
  if (active) {
    return { ...sheetStyles.row, ...sheetStyles.rowActive };
  }
  return sheetStyles.row;
};

const EMPTY = 0;
const COUNT_FIELD_WIDTH = 48;
const MIN_COUNT = 1;

type GroupListProps = {
  groups: SubSpriteGroup[];
  sheet: SheetSize;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onRemoveAll: () => void;
  onTile: (index: number, count: number) => void;
};

const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

type GroupRowProps = {
  group: SubSpriteGroup;
  sheet: SheetSize;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onTile: (count: number) => void;
};

const GroupRow = ({ group, sheet, active, onSelect, onRemove, onTile }: GroupRowProps) => {
  const [count, setCount] = useState(() => fullSheetTileCount(group, sheet));
  return (
    <div style={rowStyle(active)} onClick={onSelect}>
      <span style={sheetStyles.rowName}>{group.name || "(unnamed)"}</span>
      <span style={sheetStyles.rowSummary}>{cellCount(group)} cells</span>
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

export const GroupList = ({
  groups,
  sheet,
  selectedIndex,
  onSelect,
  onAdd,
  onRemove,
  onRemoveAll,
  onTile,
}: GroupListProps) => (
  <>
    <div style={sheetStyles.listActions}>
      <button type="button" style={sheetStyles.addButton} onClick={onAdd}>
        ＋ Add group
      </button>
      {groups.length > EMPTY && (
        <button
          type="button"
          style={sheetStyles.clearButton}
          onClick={() => {
            if (window.confirm(`Remove all ${groups.length} groups?`)) {
              onRemoveAll();
            }
          }}
        >
          Remove all
        </button>
      )}
    </div>
    <p style={sheetStyles.hint}>Or drag a rectangle on the sheet; it snaps to the cell grid.</p>
    {groups.map((group, index) => (
      <GroupRow
        key={index}
        group={group}
        sheet={sheet}
        active={index === selectedIndex}
        onSelect={() => onSelect(index)}
        onRemove={() => onRemove(index)}
        onTile={(count) => onTile(index, count)}
      />
    ))}
  </>
);
