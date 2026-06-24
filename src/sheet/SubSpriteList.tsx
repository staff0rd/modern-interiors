import type { CSSProperties } from "react";

import type { SubSprite } from "../metadata/schema.ts";
import { sheetStyles } from "./sheetStyles.ts";

const rowStyle = (active: boolean): CSSProperties => {
  if (active) {
    return { ...sheetStyles.row, ...sheetStyles.rowActive };
  }
  return sheetStyles.row;
};

const EMPTY = 0;

type SubSpriteListProps = {
  subSprites: SubSprite[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onRemoveAll: () => void;
};

export const SubSpriteList = ({
  subSprites,
  selectedIndex,
  onSelect,
  onAdd,
  onRemove,
  onRemoveAll,
}: SubSpriteListProps) => (
  <>
    <div style={sheetStyles.listActions}>
      <button type="button" style={sheetStyles.addButton} onClick={onAdd}>
        ＋ Add sub-sprite
      </button>
      {subSprites.length > EMPTY && (
        <button
          type="button"
          style={sheetStyles.clearButton}
          onClick={() => {
            if (window.confirm(`Remove all ${subSprites.length} sub-sprites?`)) {
              onRemoveAll();
            }
          }}
        >
          Remove all
        </button>
      )}
    </div>
    <p style={sheetStyles.hint}>Or drag a rectangle on the sheet to define one.</p>
    {subSprites.map((subSprite, index) => (
      <div key={index} style={rowStyle(index === selectedIndex)} onClick={() => onSelect(index)}>
        <span style={sheetStyles.rowName}>{subSprite.name || "(unnamed)"}</span>
        <span style={sheetStyles.rowSummary}>
          {subSprite.rect.width}×{subSprite.rect.height}
        </span>
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
