import { useMemo, useState } from "react";

import type { MetadataStore } from "../metadata/useMetadata.ts";
import { buildRows, filterRows, summarize, type DoneFilter, type KindFilter } from "./rows.ts";

export const useBrowse = (store: MetadataStore) => {
  const { manifest, metadata, status, error, saveState, setKind } = store;
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [doneFilter, setDoneFilter] = useState<DoneFilter>("all");

  const rows = useMemo(() => {
    if (manifest && metadata) {
      return buildRows(manifest.entries, metadata);
    }
    return [];
  }, [manifest, metadata]);

  const summary = useMemo(() => summarize(rows), [rows]);
  const filtered = useMemo(
    () => filterRows(rows, { doneFilter, kindFilter, query }),
    [rows, query, kindFilter, doneFilter],
  );

  return {
    doneFilter,
    error,
    filtered,
    kindFilter,
    manifest,
    query,
    saveState,
    setDoneFilter,
    setKind,
    setKindFilter,
    setQuery,
    status,
    summary,
  };
};
