import type { Manifest, Metadata } from "../metadata/schema.ts";
import { variantKey } from "../metadata/variantKey.ts";
import { buildRows, collapseRows, filterRows, type Row, type RowFilters } from "./rows.ts";

export type VisibleFilters = RowFilters & { collapse: boolean };

const filterCache = new WeakMap<Row[], Map<string, Row[]>>();

const filterKey = (filters: VisibleFilters): string =>
  `${filters.collapse}|${filters.kindFilter}|${filters.doneFilter}|${filters.query}`;

const applyFilters = (rows: Row[], filters: VisibleFilters): Row[] => {
  const matched = filterRows(rows, filters);
  if (filters.collapse) {
    return collapseRows(matched);
  }
  return matched;
};

// Filtering + collapsing scans every row, and both the browse list and the editor's
// Prev/next navigation request it with the same inputs, so cache per row-set identity
// (rows are themselves cached upstream) keyed by the active filters.
export const filterAndCollapse = (rows: Row[], filters: VisibleFilters): Row[] => {
  const byKey = filterCache.get(rows) ?? new Map<string, Row[]>();
  filterCache.set(rows, byKey);
  const key = filterKey(filters);
  const cached = byKey.get(key);
  if (cached) {
    return cached;
  }
  const result = applyFilters(rows, filters);
  byKey.set(key, result);
  return result;
};

export const visibleRows = (
  manifest: Manifest,
  metadata: Metadata,
  filters: VisibleFilters,
): Row[] => filterAndCollapse(buildRows(manifest, metadata), filters);

const NOT_FOUND = -1;
const STEP = 1;

const keyer = (collapsed: boolean): ((path: string) => string) => {
  if (collapsed) {
    return variantKey;
  }
  return (path) => path;
};

export const adjacentPaths = (
  rows: Row[],
  currentPath: string,
  collapsed: boolean,
): { prev: string | null; next: string | null } => {
  const toKey = keyer(collapsed);
  const target = toKey(currentPath);
  const index = rows.findIndex((row) => toKey(row.entry.path) === target);
  if (index === NOT_FOUND) {
    return { next: null, prev: null };
  }
  return {
    next: rows[index + STEP]?.entry.path ?? null,
    prev: rows[index - STEP]?.entry.path ?? null,
  };
};
