import { useState } from "react";

import { EditorHeader } from "../anim/EditorHeader.tsx";
import { editorStyles } from "../anim/editorStyles.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";
import { SheetCanvas } from "./SheetCanvas.tsx";
import { SheetPanel, type SheetMode } from "./SheetPanel.tsx";
import { sheetStyles } from "./sheetStyles.ts";
import { useSheetEditor } from "./useSheetEditor.ts";
import { useSheetGroups } from "./useSheetGroups.ts";

type SpriteSheetEditorProps = {
  store: MetadataStore;
  path: string;
  onClose: () => void;
};

export const SpriteSheetEditor = ({ store, path, onClose }: SpriteSheetEditorProps) => {
  const view = useSheetEditor(store, path);
  const groupState = useSheetGroups(store, path, view.entry);
  const [mode, setMode] = useState<SheetMode>("group");
  if (!view.entry) {
    return <div style={{ ...editorStyles.page, padding: 20 }}>Asset not found in manifest.</div>;
  }
  let onDraw = view.handlers.draw;
  if (mode === "group") {
    onDraw = groupState.handlers.draw;
  }
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
            subSprites={view.subSprites}
            selectedIndex={view.selectedIndex}
            groups={groupState.groups}
            selectedGroupIndex={groupState.selectedIndex}
            onSelect={view.handlers.select}
            onSelectGroup={groupState.handlers.select}
            onDraw={onDraw}
          />
        </div>
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
