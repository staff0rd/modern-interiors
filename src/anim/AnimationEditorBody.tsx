import type { ReactNode } from "react";

import { editorStyles, resetButtonStyle } from "./editorStyles.ts";
import { FrameSequence } from "./FrameSequence.tsx";
import GeneratedPreview from "./GeneratedPreview.tsx";
import type { AnimationEditorState } from "./useAnimationEditor.ts";
import type { GeneratedFiles } from "./useGeneratedFiles.ts";

const hintStyle = { color: "#8a8d9b", padding: 20 };

const previewPane = (
  state: AnimationEditorState,
  files: GeneratedFiles,
  reloadToken: number,
): ReactNode => {
  if (files.status === "missing") {
    return <div style={hintStyle}>Edit a field to generate and play the Phaser preview.</div>;
  }
  if (files.status !== "ready") {
    return null;
  }
  return (
    <GeneratedPreview
      animKey={state.draft.name}
      animsUrl={files.animsUrl}
      atlasUrl={files.atlasUrl}
      pngUrl={state.url}
      reloadToken={reloadToken}
      textureKey={files.textureKey}
    />
  );
};

type AnimationEditorBodyProps = {
  state: AnimationEditorState;
  files: GeneratedFiles;
  reloadToken: number;
};

export const AnimationEditorBody = ({ state, files, reloadToken }: AnimationEditorBodyProps) => {
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
      <div style={editorStyles.preview}>{previewPane(state, files, reloadToken)}</div>
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
