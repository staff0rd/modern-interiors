import type { CSSProperties } from "react";

import { editorStyles } from "./editorStyles.ts";

export const NO_ORDINAL = 0;
const EXCLUDED_OPACITY = 0.3;

const TOGGLE = {
  excluded: { glyph: "＋", title: "Include in animation" },
  included: { glyph: "−", title: "Exclude from animation" },
};

export const toggleInfo = (included: boolean) => {
  if (included) {
    return TOGGLE.included;
  }
  return TOGGLE.excluded;
};

export const ordinalLabel = (ordinal: number): string => {
  if (ordinal === NO_ORDINAL) {
    return "—";
  }
  return String(ordinal);
};

export const chipStyle = (
  selected: boolean,
  dropTarget: boolean,
  included: boolean,
): CSSProperties => {
  const style: CSSProperties = { ...editorStyles.cell, cursor: "grab" };
  if (!included) {
    style.opacity = EXCLUDED_OPACITY;
  }
  if (selected) {
    style.borderColor = "#5b8cff";
  }
  if (dropTarget) {
    style.boxShadow = "inset 3px 0 0 #7ee29b";
  }
  return style;
};

export const endDropStyle = (active: boolean): CSSProperties => {
  const style: CSSProperties = { alignSelf: "stretch", borderRadius: 4, width: 18 };
  if (active) {
    style.background = "#16361f";
    style.boxShadow = "inset 3px 0 0 #7ee29b";
  }
  return style;
};
