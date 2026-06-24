import { useAtom } from "jotai";
import { useMemo } from "react";

import type { MetadataStore } from "../metadata/useMetadata.ts";
import { collapseAtom, doneFilterAtom, kindFilterAtom, queryAtom } from "./browseAtoms.ts";
import { buildRows, summarize } from "./rows.ts";
import { filterAndCollapse } from "./visible.ts";

export const useBrowse = (store: MetadataStore) => {
  const { manifest, metadata, status, error, saveState, setKind } = store;
  const [query, setQuery] = useAtom(queryAtom);
  const [collapse, setCollapse] = useAtom(collapseAtom);
  const [kindFilter, setKindFilter] = useAtom(kindFilterAtom);
  const [doneFilter, setDoneFilter] = useAtom(doneFilterAtom);

  const rows = useMemo(() => {
    if (manifest && metadata) {
      return buildRows(manifest, metadata);
    }
    return [];
  }, [manifest, metadata]);

  const summary = useMemo(() => summarize(rows), [rows]);
  const filtered = useMemo(
    () => filterAndCollapse(rows, { collapse, doneFilter, kindFilter, query }),
    [rows, query, kindFilter, doneFilter, collapse],
  );

  return {
    collapse,
    doneFilter,
    error,
    filtered,
    kindFilter,
    manifest,
    query,
    saveState,
    setCollapse,
    setDoneFilter,
    setKind,
    setKindFilter,
    setQuery,
    status,
    summary,
  };
};
