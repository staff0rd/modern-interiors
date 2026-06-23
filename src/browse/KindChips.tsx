import { KIND_VALUES } from "../metadata/schema.ts";
import type { SaveState } from "../metadata/useMetadata.ts";
import { chipStyle, styles } from "./browseStyles.ts";
import type { KindFilter, KindSummary } from "./rows.ts";

const SAVE_LABEL: Record<SaveState, string> = {
  error: "Save failed",
  idle: "",
  saved: "Saved",
  saving: "Saving…",
};

type KindChipsProps = {
  total: number;
  summary: KindSummary;
  kindFilter: KindFilter;
  saveState: SaveState;
  onSelect: (filter: KindFilter) => void;
};

export const KindChips = ({ total, summary, kindFilter, saveState, onSelect }: KindChipsProps) => (
  <div style={styles.bar}>
    <strong>{total.toLocaleString()} assets</strong>
    <button type="button" style={chipStyle(kindFilter === "all")} onClick={() => onSelect("all")}>
      All
    </button>
    {KIND_VALUES.map((kind) => {
      const bucket = summary.get(kind);
      return (
        <button
          key={kind}
          type="button"
          style={chipStyle(kindFilter === kind)}
          onClick={() => onSelect(kind)}
        >
          {kind} · {bucket?.done}/{bucket?.total}
        </button>
      );
    })}
    <span style={{ flex: 1 }} />
    <span style={{ color: "#8a8d9b", minWidth: 60 }}>{SAVE_LABEL[saveState]}</span>
  </div>
);
