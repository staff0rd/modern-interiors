import type { MetadataStore } from "../metadata/useMetadata.ts";
import { AnimationControls } from "./AnimationControls.tsx";
import { AnimationEditorBody } from "./AnimationEditorBody.tsx";
import { AnimationTabs } from "./AnimationTabs.tsx";
import { EditorHeader } from "./EditorHeader.tsx";
import { editorStyles } from "./editorStyles.ts";
import { useAnimationEditor } from "./useAnimationEditor.ts";
import { useGeneratedFiles } from "./useGeneratedFiles.ts";
import { useReloadToken } from "./useReloadToken.ts";

const DEFAULT_TILES = 1;

type AnimationEditorProps = {
  store: MetadataStore;
  path: string;
  onClose: () => void;
};

export const AnimationEditor = ({ store, path, onClose }: AnimationEditorProps) => {
  const state = useAnimationEditor(store, path);
  const reloadToken = useReloadToken(store.saveState);
  const files = useGeneratedFiles(path, reloadToken);
  if (!state.entry) {
    return <div style={{ ...editorStyles.page, padding: 20 }}>Asset not found in manifest.</div>;
  }
  const { draft, handlers, animations, activeIndex } = state;
  return (
    <div style={editorStyles.page}>
      <EditorHeader path={path} onClose={onClose} />
      <AnimationTabs
        animations={animations}
        activeIndex={activeIndex}
        onSelect={handlers.selectAnimation}
        onAdd={handlers.addAnimation}
        onRemove={handlers.removeAnimation}
      />
      <AnimationControls
        name={draft.name}
        frameRate={draft.frameRate}
        repeat={draft.repeat}
        yoyo={draft.yoyo ?? false}
        tileColumns={draft.tileColumns ?? DEFAULT_TILES}
        tileRows={draft.tileRows ?? DEFAULT_TILES}
        saveState={store.saveState}
        onName={handlers.setName}
        onFrameRate={handlers.setFrameRate}
        onRepeat={handlers.setRepeat}
        onYoyo={handlers.setYoyo}
        onTileColumns={handlers.setTileColumns}
        onTileRows={handlers.setTileRows}
      />
      <AnimationEditorBody state={state} files={files} reloadToken={reloadToken} />
    </div>
  );
};
