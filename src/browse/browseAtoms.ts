import { atomWithStorage } from "jotai/utils";

import type { DoneFilter, KindFilter } from "./rows.ts";

export const queryAtom = atomWithStorage("browse.query", "");
export const collapseAtom = atomWithStorage("browse.collapse", true);
export const kindFilterAtom = atomWithStorage<KindFilter>("browse.kindFilter", "all");
export const doneFilterAtom = atomWithStorage<DoneFilter>("browse.doneFilter", "all");
