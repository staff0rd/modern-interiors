import { EditorHeader } from "../anim/EditorHeader.tsx";
import { editorStyles } from "../anim/editorStyles.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";
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

export const SpriteSheetEditor = ({ store, path, onClose }: SpriteSheetEditorProps) => {
  const view = useSheetEditor(store, path);
  const groupState = useSheetGroups(store, path, view.entry);
  const [mode, setMode] = useSheetMode();
  if (!view.entry) {
    return <div style={{ ...editorStyles.page, padding: 20 }}>Asset not found in manifest.</div>;
  }
  const onDraw = drawHandlerFor(mode, view, groupState);
  const gridCell = gridCellFor(mode, groupState);
  const snap = snapFor(mode, groupState);
  return (
    <div style={editorStyles.page}>
      <EditorHeader path={path} onClose={onClose} />
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
    </div>
  );
};
