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

const EMPTY = 0;

type GroupListProps = {
  groups: SubSpriteGroup[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onRemoveAll: () => void;
  onTile: (index: number) => void;
};

const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

export const GroupList = ({
  groups,
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
      <div key={index} style={rowStyle(index === selectedIndex)} onClick={() => onSelect(index)}>
        <span style={sheetStyles.rowName}>{group.name || "(unnamed)"}</span>
        <span style={sheetStyles.rowSummary}>{cellCount(group)} cells</span>
        <button
          type="button"
          style={sheetStyles.rowAction}
          title="Tile this block across the whole sheet"
          onClick={(event) => {
            stop(event);
            onTile(index);
          }}
        >
          ⧉ Tile
        </button>
        <button
          type="button"
          style={sheetStyles.removeButton}
          onClick={(event) => {
            stop(event);
            onRemove(index);
          }}
        >
          ✕
        </button>
      </div>
    ))}
  </>
);
