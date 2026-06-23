import { computeCompleteness } from "../metadata/completeness.ts";
import { KIND_VALUES, type Kind, type ManifestEntry, type Metadata } from "../metadata/schema.ts";

export type KindFilter = "all" | Kind;
export type DoneFilter = "all" | "done" | "incomplete";

export type Row = {
  entry: ManifestEntry;
  kind: Kind;
  done: boolean;
  missing: string[];
};

export type KindSummary = Map<Kind, { total: number; done: number }>;

export const buildRows = (entries: ManifestEntry[], metadata: Metadata): Row[] =>
  entries.map((entry) => {
    const meta = metadata.assets[entry.path];
    const kind = meta?.kind ?? entry.kind;
    const { done, missing } = computeCompleteness(kind, meta);
    return { done, entry, kind, missing };
  });

export const summarize = (rows: Row[]): KindSummary => {
  const summary: KindSummary = new Map();
  for (const kind of KIND_VALUES) {
    const ofKind = rows.filter((row) => row.kind === kind);
    summary.set(kind, { done: ofKind.filter((row) => row.done).length, total: ofKind.length });
  }
  return summary;
};

type RowFilters = {
  query: string;
  kindFilter: KindFilter;
  doneFilter: DoneFilter;
};

export const filterRows = (rows: Row[], filters: RowFilters): Row[] => {
  const needle = filters.query.trim().toLowerCase();
  return rows.filter((row) => {
    if (filters.kindFilter !== "all" && row.kind !== filters.kindFilter) {
      return false;
    }
    if (filters.doneFilter === "done" && !row.done) {
      return false;
    }
    if (filters.doneFilter === "incomplete" && row.done) {
      return false;
    }
    if (needle && !row.entry.path.toLowerCase().includes(needle)) {
      return false;
    }
    return true;
  });
};
