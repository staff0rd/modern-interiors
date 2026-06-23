import type { CSSProperties } from "react";

import { SAVE_LABELS } from "../metadata/saveLabels.ts";
import type { SaveState } from "../metadata/useMetadata.ts";
import { GroupPanel } from "./GroupPanel.tsx";
import { sheetStyles } from "./sheetStyles.ts";
import { SubPanel } from "./SubPanel.tsx";
import type { SheetEditorState } from "./useSheetEditor.ts";
import type { SheetGroupsState } from "./useSheetGroups.ts";

export type SheetMode = "group" | "sub";

const tabStyle = (active: boolean): CSSProperties => {
  if (active) {
    return { ...sheetStyles.addButton, borderColor: "#5b8cff", borderStyle: "solid", flex: 1 };
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
    {mode === "group" && <GroupPanel groupState={groupState} />}
    {mode === "sub" && <SubPanel view={view} />}
    <span style={{ color: "#8a8d9b", fontSize: 12 }}>{SAVE_LABELS[saveState]}</span>
  </div>
);
