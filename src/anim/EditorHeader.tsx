import type { CSSProperties } from "react";

import { backButtonStyle, editorStyles } from "./editorStyles.ts";

const pathStyle: CSSProperties = { color: "#cfd2dc", fontFamily: "monospace", fontSize: 12 };

type EditorHeaderProps = {
  path: string;
  onClose: () => void;
};

export const EditorHeader = ({ path, onClose }: EditorHeaderProps) => (
  <div style={editorStyles.header}>
    <button type="button" style={backButtonStyle} onClick={onClose}>
      ← Back
    </button>
    <span style={pathStyle}>{path}</span>
  </div>
);
