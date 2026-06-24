import type { CSSProperties, ReactNode } from "react";

import { EditorHeader, type EditorNav } from "../anim/EditorHeader.tsx";
import { editorStyles } from "../anim/editorStyles.ts";

const readOnlyZone: CSSProperties = {
  display: "flex",
  flex: 1,
  flexDirection: "column",
  minHeight: 0,
  opacity: 0.9,
  pointerEvents: "none",
};

const Zone = ({ readOnly, children }: { readOnly: boolean; children: ReactNode }): ReactNode => {
  if (readOnly) {
    return <div style={readOnlyZone}>{children}</div>;
  }
  return children;
};

type EditorChromeProps = {
  path: string;
  onClose: () => void;
  nav?: EditorNav;
  readOnly?: boolean;
  notice?: ReactNode;
  children: ReactNode;
};

// Shared editor shell: back/header always interactive, an optional notice banner
// (e.g. the derived-variant detach prompt), then the body — which is made inert
// When readOnly so a derived variant shows its real frames/animation but can't be edited.
export const EditorChrome = ({
  path,
  onClose,
  nav,
  readOnly = false,
  notice,
  children,
}: EditorChromeProps): ReactNode => (
  <div style={editorStyles.page}>
    <EditorHeader path={path} onClose={onClose} nav={nav} />
    {notice}
    <Zone readOnly={readOnly}>{children}</Zone>
  </div>
);
