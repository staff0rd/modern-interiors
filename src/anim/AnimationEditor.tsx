import type { ReactNode } from "react";

import type { MetadataStore } from "../metadata/useMetadata.ts";
import { AnimationControls } from "./AnimationControls.tsx";
import AnimationPreview from "./AnimationPreview.tsx";
import { AnimationTabs } from "./AnimationTabs.tsx";
import { EditorHeader } from "./EditorHeader.tsx";
import { editorStyles, resetButtonStyle } from "./editorStyles.ts";
import { FrameSequence } from "./FrameSequence.tsx";
import { useAnimationEditor, type AnimationEditorState } from "./useAnimationEditor.ts";

const TEXTURE_KEY = "sheet";
const DEFAULT_TILES = 1;

const editorBody = (state: AnimationEditorState): ReactNode => {
  const { geometry, url, draft, handlers, activeIndex } = state;
  if (!geometry) {
    return (
      <div style={{ padding: 20 }}>
        Frame size is unknown for this asset, so its frames cannot be sliced. Set a frame size to
        author an animation.
      </div>
    );
  }
  const excluded = new Set(draft.excludedFrames ?? []);
  const played = draft.frameOrder.filter((frame) => !excluded.has(frame));
  return (
    <div style={editorStyles.body}>
      <div style={editorStyles.preview}>
        <AnimationPreview
          textureKey={TEXTURE_KEY}
          url={url}
          frameWidth={geometry.frameWidth}
          frameHeight={geometry.frameHeight}
          frameOrder={played}
          frameRate={draft.frameRate}
          repeat={draft.repeat}
          yoyo={draft.yoyo ?? false}
        />
      </div>
      <div style={editorStyles.stripBar}>
        <span>
          {played.length} of {draft.frameOrder.length} frames included — click to select (Shift/⌘
          for many), drag to move, ＋/− to include/exclude
        </span>
        <button type="button" style={resetButtonStyle} onClick={handlers.resetFrames}>
          Reset to all frames
        </button>
      </div>
      <FrameSequence
        key={activeIndex}
        geometry={geometry}
        url={url}
        frameOrder={draft.frameOrder}
        excluded={excluded}
        onMove={handlers.moveFrames}
        onToggle={handlers.toggleExcluded}
      />
    </div>
  );
};

type AnimationEditorProps = {
  store: MetadataStore;
  path: string;
  onClose: () => void;
};

export const AnimationEditor = ({ store, path, onClose }: AnimationEditorProps) => {
  const state = useAnimationEditor(store, path);
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
      {editorBody(state)}
    </div>
  );
};
