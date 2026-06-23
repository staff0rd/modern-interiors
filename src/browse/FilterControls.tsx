import { styles } from "./browseStyles.ts";
import type { DoneFilter } from "./rows.ts";

type FilterControlsProps = {
  query: string;
  doneFilter: DoneFilter;
  shown: number;
  onQuery: (value: string) => void;
  onDoneFilter: (value: DoneFilter) => void;
};

export const FilterControls = ({
  query,
  doneFilter,
  shown,
  onQuery,
  onDoneFilter,
}: FilterControlsProps) => (
  <div style={styles.bar}>
    <input
      style={styles.input}
      placeholder="Filter by path…"
      value={query}
      onChange={(event) => onQuery(event.target.value)}
    />
    <select
      style={styles.select}
      value={doneFilter}
      onChange={(event) => onDoneFilter(event.target.value as DoneFilter)}
    >
      <option value="all">All completeness</option>
      <option value="done">Done</option>
      <option value="incomplete">Incomplete</option>
    </select>
    <span style={{ color: "#8a8d9b" }}>{shown.toLocaleString()} shown</span>
  </div>
);
