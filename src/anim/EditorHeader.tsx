import type { CSSProperties } from "react";

import { backButtonStyle, editorStyles } from "./editorStyles.ts";

const pathStyle: CSSProperties = { color: "#cfd2dc", fontFamily: "monospace", fontSize: 12 };
const stepStyle: CSSProperties = { ...backButtonStyle, padding: "5px 10px" };

export type EditorNav = { onPrev?: () => void; onNext?: () => void };

type EditorHeaderProps = {
  path: string;
  onClose: () => void;
  nav?: EditorNav;
};

export const EditorHeader = ({ path, onClose, nav }: EditorHeaderProps) => (
  <div style={editorStyles.header}>
    <button type="button" style={backButtonStyle} onClick={onClose}>
      ← Back
    </button>
    <button
      type="button"
      style={stepStyle}
      disabled={!nav?.onPrev}
      title="Previous asset"
      onClick={nav?.onPrev}
    >
      ‹ Prev
    </button>
    <button
      type="button"
      style={stepStyle}
      disabled={!nav?.onNext}
      title="Next asset"
      onClick={nav?.onNext}
    >
      Next ›
    </button>
    <span style={pathStyle}>{path}</span>
  </div>
);
