import type { ReactNode } from "react";

import type { EditorNav } from "../anim/EditorHeader.tsx";
import { editorStyles } from "../anim/editorStyles.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";
import { EditorChrome } from "../variants/EditorChrome.tsx";
import { GroupDetailPanel } from "./GroupDetailPanel.tsx";
import { SheetCanvas } from "./SheetCanvas.tsx";
import { SheetPanel } from "./SheetPanel.tsx";
import { drawHandlerFor, gridCellFor, snapFor, defaultMode } from "./sheetModeHelpers.ts";
import { sheetStyles } from "./sheetStyles.ts";
import { SubSpriteDetailPanel } from "./SubSpriteDetailPanel.tsx";
import { TileDetailPanel } from "./TileDetailPanel.tsx";
import { useSheetMode } from "./useSheetMode.ts";
import { useSheetEditor } from "./useSheetEditor.ts";
import { useSheetGroups } from "./useSheetGroups.ts";

type SpriteSheetEditorProps = {
  store: MetadataStore;
  path: string;
  onClose: () => void;
  nav?: EditorNav;
  readOnly?: boolean;
  notice?: ReactNode;
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
        <TileDetailPanel mode={mode} view={view} groupState={groupState} />
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
