import type { CSSProperties } from "react";

import { KIND_VALUES, type Kind } from "../metadata/schema.ts";
import { badgeStyle, styles } from "./browseStyles.ts";
import type { Row } from "./rows.ts";

const frameLabel = (frameWidth: number | null, frameHeight: number | null): string => {
  if (frameWidth && frameHeight) {
    return ` · ${frameWidth}×${frameHeight}`;
  }
  return "";
};

const doneLabel = (done: boolean): string => {
  if (done) {
    return "done";
  }
  return "incomplete";
};

const editable = (kind: Kind): boolean => kind === "animation";

const rowStyle = (kind: Kind): CSSProperties => {
  if (editable(kind)) {
    return { ...styles.row, cursor: "pointer" };
  }
  return styles.row;
};

type AssetRowProps = {
  row: Row;
  root: string;
  onKindChange: (path: string, kind: Kind) => void;
  onEdit: (path: string) => void;
};

export const AssetRow = ({ row, root, onKindChange, onEdit }: AssetRowProps) => {
  const open = () => {
    if (editable(row.kind)) {
      onEdit(row.entry.path);
    }
  };
  return (
    <div style={rowStyle(row.kind)} onClick={open}>
      <img src={`/${root}/${row.entry.path}`} alt="" loading="lazy" style={styles.thumb} />
      <span style={styles.path} title={row.entry.path}>
        {row.entry.path}
      </span>
      <span style={styles.meta}>
        {row.entry.width}×{row.entry.height}
        {frameLabel(row.entry.frameWidth, row.entry.frameHeight)}
      </span>
      <select
        style={styles.select}
        value={row.kind}
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => onKindChange(row.entry.path, event.target.value as Kind)}
      >
        {KIND_VALUES.map((kind) => (
          <option key={kind} value={kind}>
            {kind}
          </option>
        ))}
      </select>
      <span style={badgeStyle(row.done)} title={row.missing.join(", ")}>
        {doneLabel(row.done)}
      </span>
    </div>
  );
};
