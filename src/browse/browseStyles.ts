import type { CSSProperties } from "react";

export const ROW_HEIGHT = 56;
const THUMB_SIZE = 40;

export const styles = {
  badge: {
    borderRadius: 4,
    flexShrink: 0,
    fontSize: 11,
    padding: "2px 8px",
    textAlign: "center",
    width: 78,
  },
  bar: {
    alignItems: "center",
    borderBottom: "1px solid #2a2c36",
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    padding: "10px 14px",
  },
  chip: {
    background: "#1d1f27",
    border: "1px solid #2a2c36",
    borderRadius: 999,
    color: "#e8e8ef",
    cursor: "pointer",
    padding: "4px 10px",
  },
  chipActive: { background: "#243049", border: "1px solid #5b8cff" },
  input: {
    background: "#1d1f27",
    border: "1px solid #2a2c36",
    borderRadius: 6,
    color: "#e8e8ef",
    minWidth: 220,
    padding: "6px 10px",
  },
  meta: { color: "#8a8d9b", flexShrink: 0, fontSize: 12, width: 130 },
  page: {
    color: "#e8e8ef",
    display: "flex",
    flexDirection: "column",
    font: "14px system-ui, sans-serif",
    height: "100%",
  },
  path: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 12,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  row: {
    alignItems: "center",
    borderBottom: "1px solid #20222b",
    display: "flex",
    gap: 12,
    height: ROW_HEIGHT,
    padding: "0 14px",
  },
  select: {
    background: "#1d1f27",
    border: "1px solid #2a2c36",
    borderRadius: 6,
    color: "#e8e8ef",
    padding: "5px 8px",
  },
  thumb: {
    background: "#0d0e12",
    borderRadius: 4,
    flexShrink: 0,
    height: THUMB_SIZE,
    imageRendering: "pixelated",
    objectFit: "contain",
    width: THUMB_SIZE,
  },
} satisfies Record<string, CSSProperties>;

export const chipStyle = (active: boolean): CSSProperties => {
  if (active) {
    return { ...styles.chip, ...styles.chipActive };
  }
  return styles.chip;
};

export const badgeStyle = (done: boolean): CSSProperties => {
  if (done) {
    return { ...styles.badge, background: "#16361f", color: "#7ee29b" };
  }
  return { ...styles.badge, background: "#3a2418", color: "#ffb27a" };
};
