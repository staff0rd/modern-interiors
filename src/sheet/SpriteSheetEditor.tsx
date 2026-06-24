import type { ReactNode } from "react";

import type { EditorNav } from "../anim/EditorHeader.tsx";
import { editorStyles } from "../anim/editorStyles.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";
import { EditorChrome } from "../variants/EditorChrome.tsx";
import { GroupDetailPanel } from "./GroupDetailPanel.tsx";
import { snapRect } from "./groupCells.ts";
import { SheetCanvas } from "./SheetCanvas.tsx";
import { SheetPanel, type SheetMode } from "./SheetPanel.tsx";
import { sheetStyles } from "./sheetStyles.ts";
import { SubSpriteDetailPanel } from "./SubSpriteDetailPanel.tsx";
import { useSheetMode } from "./useSheetMode.ts";
import { useSheetEditor, type Rect, type SheetEditorState } from "./useSheetEditor.ts";
import { useSheetGroups, type SheetGroupsState } from "./useSheetGroups.ts";

type SpriteSheetEditorProps = {
  store: MetadataStore;
  path: string;
  onClose: () => void;
  nav?: EditorNav;
  readOnly?: boolean;
  notice?: ReactNode;
};

const drawHandlerFor = (mode: SheetMode, view: SheetEditorState, groupState: SheetGroupsState) => {
  if (mode === "group") {
    return groupState.handlers.draw;
  }
  return view.handlers.draw;
};

const gridCellFor = (mode: SheetMode, groupState: SheetGroupsState) => {
  if (mode === "group" && groupState.showGrid) {
    return { height: groupState.template.cellHeight, width: groupState.template.cellWidth };
  }
  return undefined;
};

const snapFor = (mode: SheetMode, groupState: SheetGroupsState) => {
  if (mode === "group") {
    const { cellWidth, cellHeight } = groupState.template;
    return (rect: Rect) => snapRect(rect, cellWidth, cellHeight);
  }
  return undefined;
};

const NO_SUBS = 0;

const defaultMode = (subSpriteCount: number): SheetMode => {
  if (subSpriteCount > NO_SUBS) {
    return "sub";
  }
  return "group";
};

export const SpriteSheetEditor = ({
  store,
  path,
  onClose,
  nav,
  readOnly,
  notice,
}: SpriteSheetEditorProps) => {
  const view = useSheetEditor(store, path);
  const groupState = useSheetGroups(store, path, view.entry);
  const [mode, setMode] = useSheetMode(defaultMode(view.subSprites.length));
  if (!view.entry) {
    return <div style={{ ...editorStyles.page, padding: 20 }}>Asset not found in manifest.</div>;
  }
  const onDraw = drawHandlerFor(mode, view, groupState);
  const gridCell = gridCellFor(mode, groupState);
  const snap = snapFor(mode, groupState);
  return (
    <EditorChrome path={path} onClose={onClose} nav={nav} readOnly={readOnly} notice={notice}>
      <div style={sheetStyles.body}>
        <div style={sheetStyles.canvasArea}>
          <SheetCanvas
            url={view.url}
            width={view.entry.width}
            height={view.entry.height}
            scale={view.scale}
            mode={mode}
            gridCell={gridCell}
            snap={snap}
            subSprites={view.subSprites}
            selectedIndex={view.selectedIndex}
            groups={groupState.groups}
            selectedGroupIndex={groupState.selectedIndex}
            onSelect={view.handlers.select}
            onSelectGroup={groupState.handlers.toggle}
            onDraw={onDraw}
          />
        </div>
        <GroupDetailPanel mode={mode} view={view} groupState={groupState} />
        <SubSpriteDetailPanel mode={mode} view={view} />
        <SheetPanel
          mode={mode}
          onMode={setMode}
          view={view}
          groupState={groupState}
          saveState={store.saveState}
        />
      </div>
    </EditorChrome>
  );
};
