import { snapRect } from "./groupCells.ts";
import type { SheetMode } from "./SheetPanel.tsx";
import type { Rect, SheetEditorState } from "./useSheetEditor.ts";
import type { SheetGroupsState } from "./useSheetGroups.ts";

const NO_SUBS = 0;

export const drawHandlerFor = (
  mode: SheetMode,
  view: SheetEditorState,
  groupState: SheetGroupsState,
) => {
  if (mode === "group") {
    return groupState.handlers.draw;
  }
  return view.handlers.draw;
};

export const gridCellFor = (mode: SheetMode, groupState: SheetGroupsState) => {
  if (mode === "group" && groupState.showGrid) {
    return { height: groupState.template.cellHeight, width: groupState.template.cellWidth };
  }
  return undefined;
};

export const snapFor = (mode: SheetMode, groupState: SheetGroupsState) => {
  if (mode === "group") {
    const { cellWidth, cellHeight } = groupState.template;
    return (rect: Rect) => snapRect(rect, cellWidth, cellHeight);
  }
  return undefined;
};

export const defaultMode = (subSpriteCount: number): SheetMode => {
  if (subSpriteCount > NO_SUBS) {
    return "sub";
  }
  return "group";
};
