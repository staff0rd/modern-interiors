import type { CSSProperties } from "react";

import type { SubSpriteGroup } from "../metadata/schema.ts";
import { cellCount } from "./groupCells.ts";
import { sheetStyles } from "./sheetStyles.ts";

const rowStyle = (active: boolean): CSSProperties => {
  if (active) {
    return { ...sheetStyles.row, ...sheetStyles.rowActive };
  }
  return sheetStyles.row;
};

type GroupListProps = {
  groups: SubSpriteGroup[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export const GroupList = ({ groups, selectedIndex, onSelect, onAdd, onRemove }: GroupListProps) => (
  <>
    <button type="button" style={sheetStyles.addButton} onClick={onAdd}>
      ＋ Add group
    </button>
    <p style={sheetStyles.hint}>Or drag a rectangle on the sheet; it snaps to the cell grid.</p>
    {groups.map((group, index) => (
      <div key={index} style={rowStyle(index === selectedIndex)} onClick={() => onSelect(index)}>
        <span style={sheetStyles.rowName}>{group.name || "(unnamed)"}</span>
        <span style={sheetStyles.rowSummary}>{cellCount(group)} cells</span>
        <button
          type="button"
          style={sheetStyles.removeButton}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(index);
          }}
        >
          ✕
        </button>
      </div>
    ))}
  </>
);
