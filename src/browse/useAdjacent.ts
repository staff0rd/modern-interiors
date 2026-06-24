import { useAtomValue } from "jotai";
import { useMemo } from "react";

import type { Manifest, Metadata } from "../metadata/schema.ts";
import { collapseAtom, doneFilterAtom, kindFilterAtom, queryAtom } from "./browseAtoms.ts";
import { adjacentPaths, visibleRows } from "./visible.ts";

type Adjacent = { prev: string | null; next: string | null };

// The previous/next asset relative to `path` in the same list the browse view
// Currently shows (its filters + collapse), so editing can step through the index.
export const useAdjacent = (manifest: Manifest, metadata: Metadata, path: string): Adjacent => {
  const query = useAtomValue(queryAtom);
  const kindFilter = useAtomValue(kindFilterAtom);
  const doneFilter = useAtomValue(doneFilterAtom);
  const collapse = useAtomValue(collapseAtom);
  const rows = useMemo(
    () => visibleRows(manifest, metadata, { collapse, doneFilter, kindFilter, query }),
    [manifest, metadata, collapse, doneFilter, kindFilter, query],
  );
  return useMemo(() => adjacentPaths(rows, path, collapse), [rows, path, collapse]);
};
