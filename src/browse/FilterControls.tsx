import type { CSSProperties } from "react";

import { styles } from "./browseStyles.ts";
import type { DoneFilter } from "./rows.ts";

const clearButtonStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#8a8d9b",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
  marginLeft: -28,
  padding: "0 8px",
};

type FilterControlsProps = {
  query: string;
  doneFilter: DoneFilter;
  collapse: boolean;
  shown: number;
  onQuery: (value: string) => void;
  onDoneFilter: (value: DoneFilter) => void;
  onCollapse: (value: boolean) => void;
};

export const FilterControls = ({
  query,
  doneFilter,
  collapse,
  shown,
  onQuery,
  onDoneFilter,
  onCollapse,
}: FilterControlsProps) => (
  <div style={styles.bar}>
    <input
      style={styles.input}
      placeholder="Filter by path… (comma-separated; prefix - to exclude)"
      value={query}
      onChange={(event) => onQuery(event.target.value)}
    />
    {query && (
      <button
        type="button"
        style={clearButtonStyle}
        title="Clear filter"
        onClick={() => onQuery("")}
      >
        ×
      </button>
    )}
    <select
      style={styles.select}
      value={doneFilter}
      onChange={(event) => onDoneFilter(event.target.value as DoneFilter)}
    >
      <option value="all">All completeness</option>
      <option value="done">Done</option>
      <option value="incomplete">Incomplete</option>
    </select>
    <label style={{ alignItems: "center", display: "flex", gap: 6 }}>
      <input
        type="checkbox"
        checked={collapse}
        onChange={(event) => onCollapse(event.target.checked)}
      />
      Collapse size variants
    </label>
    <span style={{ color: "#8a8d9b" }}>{shown.toLocaleString()} shown</span>
  </div>
);
