import { computeCompleteness } from "../metadata/completeness.ts";
import { KIND_VALUES, type Kind, type Manifest, type Metadata } from "../metadata/schema.ts";
import { buildVariantIndex } from "../metadata/variantIndex.ts";
import { variantKey } from "../metadata/variantKey.ts";
import { resolveMetadata, type MetadataSource } from "../metadata/variants.ts";

export type KindFilter = "all" | Kind;
export type DoneFilter = "all" | "done" | "incomplete";

export type Row = {
  entry: Manifest["entries"][number];
  kind: Kind;
  done: boolean;
  missing: string[];
  variantCount: number;
  source: MetadataSource;
};

export type KindSummary = Map<Kind, { total: number; done: number }>;

const SINGLE_VARIANT = 1;
const EMPTY = 0;
const AFTER_DASH = 1;
const EXCLUDE_PREFIX = "-";

const rowsCache = new WeakMap<Manifest, WeakMap<Metadata, Row[]>>();

const computeRows = (manifest: Manifest, metadata: Metadata): Row[] => {
  const index = buildVariantIndex(manifest);
  return manifest.entries.map((entry) => {
    const resolved = resolveMetadata(entry.path, metadata, index);
    const kind = resolved.meta.kind ?? entry.kind;
    const { done, missing } = computeCompleteness(kind, resolved.meta);
    return { done, entry, kind, missing, source: resolved.source, variantCount: SINGLE_VARIANT };
  });
};

// Building rows scans the whole pack (tens of thousands of entries), so cache by the
// Identity of its immutable inputs: the manifest is fixed for the session and metadata
// Is replaced only on save, so navigating between views reuses the prior result.
export const buildRows = (manifest: Manifest, metadata: Metadata): Row[] => {
  const byMetadata = rowsCache.get(manifest) ?? new WeakMap<Metadata, Row[]>();
  rowsCache.set(manifest, byMetadata);
  const cached = byMetadata.get(metadata);
  if (cached) {
    return cached;
  }
  const rows = computeRows(manifest, metadata);
  byMetadata.set(metadata, rows);
  return rows;
};

export const summarize = (rows: Row[]): KindSummary => {
  const summary: KindSummary = new Map();
  for (const kind of KIND_VALUES) {
    const ofKind = rows.filter((row) => row.kind === kind);
    summary.set(kind, { done: ofKind.filter((row) => row.done).length, total: ofKind.length });
  }
  return summary;
};

export type RowFilters = {
  query: string;
  kindFilter: KindFilter;
  doneFilter: DoneFilter;
};

type QueryTerms = { includes: string[]; excludes: string[] };

const parseQuery = (query: string): QueryTerms => {
  const terms = query
    .split(",")
    .map((raw) => raw.trim().toLowerCase())
    .filter((term) => term.length > EMPTY);
  const excludes = terms
    .filter((term) => term.startsWith(EXCLUDE_PREFIX))
    .map((term) => term.slice(AFTER_DASH).trim())
    .filter((body) => body.length > EMPTY);
  const includes = terms.filter((term) => !term.startsWith(EXCLUDE_PREFIX));
  return { excludes, includes };
};

const matchesQuery = (path: string, terms: QueryTerms): boolean => {
  if (terms.excludes.some((term) => path.includes(term))) {
    return false;
  }
  return terms.includes.every((term) => path.includes(term));
};

export const filterRows = (rows: Row[], filters: RowFilters): Row[] => {
  const terms = parseQuery(filters.query);
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
    return matchesQuery(row.entry.path.toLowerCase(), terms);
  });
};

const groupByKey = (rows: Row[]): Map<string, Row[]> => {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = variantKey(row.entry.path);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(row);
    } else {
      groups.set(key, [row]);
    }
  }
  return groups;
};

const largestVariant = (bucket: Row[]): Row =>
  bucket.reduce((largest, row) => {
    if (row.entry.width > largest.entry.width) {
      return row;
    }
    return largest;
  });

export const collapseRows = (rows: Row[]): Row[] => {
  const collapsed: Row[] = [];
  for (const bucket of groupByKey(rows).values()) {
    collapsed.push({ ...largestVariant(bucket), variantCount: bucket.length });
  }
  return collapsed;
};
