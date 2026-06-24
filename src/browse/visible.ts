import type { Manifest, Metadata } from "../metadata/schema.ts";
import { variantKey } from "../metadata/variantKey.ts";
import { buildRows, collapseRows, filterRows, type Row, type RowFilters } from "./rows.ts";

export type VisibleFilters = RowFilters & { collapse: boolean };

export const filterAndCollapse = (rows: Row[], filters: VisibleFilters): Row[] => {
  const matched = filterRows(rows, filters);
  if (filters.collapse) {
    return collapseRows(matched);
  }
  return matched;
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
