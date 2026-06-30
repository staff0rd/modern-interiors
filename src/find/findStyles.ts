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
  body: {
    color: "#e8e8ef",
    flex: 1,
    font: "13px system-ui, sans-serif",
    minHeight: 0,
    overflowY: "auto",
    padding: 16,
  },
  cells: { color: "#8a8d9b", fontFamily: "monospace", fontSize: 12, marginTop: 4 },
  count: { color: "#8ad0ff", fontVariantNumeric: "tabular-nums" },
  empty: { color: "#8a8d9b", padding: 16 },
  file: {
    alignItems: "flex-start",
    borderBottom: "1px solid #2a2c36",
    display: "flex",
    gap: 12,
    padding: "10px 0",
  },
  fileInfo: { flex: 1, minWidth: 0 },
  filePath: { color: "#e8e8ef", fontFamily: "monospace", fontSize: 13, wordBreak: "break-all" },
  fileRow: { alignItems: "baseline", display: "flex", gap: 12, justifyContent: "space-between" },
  hero: { alignItems: "center", display: "flex", gap: 16, marginBottom: 16 },
  link: { color: "#8ad0ff", textDecoration: "none" },
  page: { display: "flex", flexDirection: "column", height: "100%" },
  summary: { color: "#8a8d9b", marginBottom: 12 },
} satisfies Record<string, CSSProperties>;
