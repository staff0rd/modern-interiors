import type { CSSProperties } from "react";

import { SAVE_LABELS } from "../metadata/saveLabels.ts";
import type { SaveState } from "../metadata/useMetadata.ts";
import { GroupPanel } from "./GroupPanel.tsx";
import { sheetStyles } from "./sheetStyles.ts";
import { SubPanel } from "./SubPanel.tsx";
import type { SheetEditorState } from "./useSheetEditor.ts";
import type { SheetGroupsState } from "./useSheetGroups.ts";

export type SheetMode = "group" | "sub";

const modeHint = (mode: SheetMode): string => {
  if (mode === "group") {
    return "Groups: a repeating block of cells (e.g. a 2×3 floor style) you can Tile across the sheet.";
  }
  return "Sub-sprites: individual named rectangles. The dimmed orange rects are sub-sprites.";
};

const tabStyle = (active: boolean): CSSProperties => {
  if (active) {
    return { ...sheetStyles.addButton, border: "1px solid #5b8cff", flex: 1 };
  }
  return { ...sheetStyles.addButton, flex: 1 };
};

type SheetPanelProps = {
  mode: SheetMode;
  onMode: (mode: SheetMode) => void;
  view: SheetEditorState;
  groupState: SheetGroupsState;
  saveState: SaveState;
};

export const SheetPanel = ({ mode, onMode, view, groupState, saveState }: SheetPanelProps) => (
  <div style={sheetStyles.panel}>
    <div style={{ display: "flex", gap: 8 }}>
      <button type="button" style={tabStyle(mode === "group")} onClick={() => onMode("group")}>
        Groups
      </button>
      <button type="button" style={tabStyle(mode === "sub")} onClick={() => onMode("sub")}>
        Sub-sprites
      </button>
    </div>
    <p style={sheetStyles.hint}>{modeHint(mode)}</p>
    {mode === "group" && <GroupPanel groupState={groupState} />}
    {mode === "sub" && (
      <SubPanel view={view} groupRects={groupState.groups.map((group) => group.rect)} />
    )}
    <span style={{ color: "#8a8d9b", fontSize: 12 }}>{SAVE_LABELS[saveState]}</span>
  </div>
);
