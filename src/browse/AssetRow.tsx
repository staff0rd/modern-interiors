import { KIND_VALUES, type Kind } from "../metadata/schema.ts";
import { badgeStyle, styles } from "./browseStyles.ts";
import type { Row } from "./rows.ts";

const doneLabel = (done: boolean): string => {
  if (done) {
    return "done";
  }
  return "incomplete";
};

type KindCellProps = {
  row: Row;
  onKindChange: (path: string, kind: Kind) => void;
};

const KindCell = ({ row, onKindChange }: KindCellProps) => {
  if (row.source === "derived") {
    return (
      <span style={{ ...styles.meta, fontStyle: "italic" }} title="Derived from canonical variant">
        {row.kind} · linked
      </span>
    );
  }
  return (
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
  );
};

type AssetRowProps = {
  row: Row;
  root: string;
  onKindChange: (path: string, kind: Kind) => void;
  onEdit: (path: string) => void;
};

export const AssetRow = ({ row, root, onKindChange, onEdit }: AssetRowProps) => {
  const open = () => onEdit(row.entry.path);
  return (
    <div style={{ ...styles.row, cursor: "pointer" }} onClick={open}>
      <img src={`/${root}/${row.entry.path}`} alt="" loading="lazy" style={styles.thumb} />
      <span style={styles.path} title={row.entry.path}>
        {row.entry.path}
      </span>
      <span style={styles.meta}>
        {row.entry.width}×{row.entry.height}
      </span>
      <KindCell row={row} onKindChange={onKindChange} />
      <span style={badgeStyle(row.done)} title={row.missing.join(", ")}>
        {doneLabel(row.done)}
      </span>
    </div>
  );
};
