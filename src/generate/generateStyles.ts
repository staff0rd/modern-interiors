import type { CSSProperties } from "react";

export const styles = {
  bar: {
    alignItems: "center",
    background: "#16171d",
    borderBottom: "1px solid #2a2c36",
    color: "#e8e8ef",
    display: "flex",
    font: "13px system-ui, sans-serif",
    gap: 12,
    padding: "8px 14px",
  },
  binding: {
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  body: { display: "flex", flex: 1, minHeight: 0 },
  button: {
    background: "#243049",
    border: "1px solid #5b8cff",
    borderRadius: 6,
    color: "#e8e8ef",
    cursor: "pointer",
    padding: "5px 12px",
  },
  canvas: { flex: 1, minHeight: 0, minWidth: 0 },
  field: {
    background: "#1d1f27",
    border: "1px solid #2a2c36",
    borderRadius: 6,
    color: "#e8e8ef",
    padding: "5px 8px",
    width: 96,
  },
  inspector: {
    background: "#1a1b22",
    borderLeft: "1px solid #2a2c36",
    color: "#e8e8ef",
    display: "flex",
    flexDirection: "column",
    font: "12px system-ui, sans-serif",
    gap: 12,
    overflowY: "auto",
    padding: 12,
    width: 420,
  },
  link: { color: "#8ad0ff" },
  meta: { color: "#8a8d9b", fontSize: 11 },
  page: { display: "flex", flexDirection: "column", height: "100%" },
  palette: { display: "grid", gap: 2 },
  swatch: {
    background: "#0d0e12",
    border: "1px solid transparent",
    cursor: "pointer",
    padding: 0,
  },
  swatchActive: { border: "1px solid #5b8cff" },
} satisfies Record<string, CSSProperties>;

export const swatchStyle = (active: boolean): CSSProperties => {
  if (active) {
    return { ...styles.swatch, ...styles.swatchActive };
  }
  return styles.swatch;
};

export const columns = (count: number): CSSProperties => ({
  ...styles.palette,
  gridTemplateColumns: `repeat(${count}, max-content)`,
});
