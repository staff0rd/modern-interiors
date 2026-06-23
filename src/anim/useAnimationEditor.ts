import { useMemo, useState } from "react";

import { animationSchema, type Animation, type ManifestEntry } from "../metadata/schema.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";
import {
  allFrames,
  defaultAnimation,
  frameGridGeometry,
  moveFrames,
  toggleMember,
  type FrameGridGeometry,
} from "./frames.ts";

const FIRST = 0;
const DEFAULT_TILES = 1;

type AnimationHandlers = {
  setName: (name: string) => void;
  setFrameRate: (frameRate: number) => void;
  setRepeat: (repeat: number) => void;
  setYoyo: (yoyo: boolean) => void;
  setTileColumns: (columns: number) => void;
  setTileRows: (rows: number) => void;
  moveFrames: (positions: number[], target: number) => void;
  toggleExcluded: (frame: number) => void;
  resetFrames: () => void;
};

export type AnimationEditorState = {
  entry: ManifestEntry | undefined;
  geometry: FrameGridGeometry | null;
  url: string;
  draft: Animation;
  handlers: AnimationHandlers;
};

type HandlerContext = {
  draft: Animation;
  entry: ManifestEntry | undefined;
  commit: (next: Animation) => void;
};

const geometryFor = (
  entry: ManifestEntry | undefined,
  columns: number,
  rows: number,
): FrameGridGeometry | null => {
  if (!entry) {
    return null;
  }
  return frameGridGeometry(entry, columns, rows);
};

const rescale = (context: HandlerContext, columns: number, rows: number): Animation => {
  const geometry = geometryFor(context.entry, columns, rows);
  return {
    ...context.draft,
    excludedFrames: [],
    frameOrder: allFrames(geometry),
    tileColumns: columns,
    tileRows: rows,
  };
};

const makeHandlers = (context: HandlerContext): AnimationHandlers => {
  const { draft, commit } = context;
  const columns = draft.tileColumns ?? DEFAULT_TILES;
  const rows = draft.tileRows ?? DEFAULT_TILES;
  return {
    moveFrames: (positions, target) =>
      commit({ ...draft, frameOrder: moveFrames(draft.frameOrder, new Set(positions), target) }),
    resetFrames: () => commit(rescale(context, columns, rows)),
    setFrameRate: (frameRate) => commit({ ...draft, frameRate }),
    setName: (name) => commit({ ...draft, name }),
    setRepeat: (repeat) => commit({ ...draft, repeat }),
    setTileColumns: (next) => commit(rescale(context, next, rows)),
    setTileRows: (next) => commit(rescale(context, columns, next)),
    setYoyo: (yoyo) => commit({ ...draft, yoyo }),
    toggleExcluded: (frame) =>
      commit({ ...draft, excludedFrames: toggleMember(draft.excludedFrames ?? [], frame) }),
  };
};

export const useAnimationEditor = (store: MetadataStore, path: string): AnimationEditorState => {
  const { manifest, metadata, setAnimations } = store;
  const entry = manifest?.entries.find((candidate) => candidate.path === path);
  const existing = metadata?.assets[path]?.animations?.[FIRST];
  const [draft, setDraft] = useState<Animation>(() => existing ?? defaultAnimation(entry));
  const geometry = useMemo(
    () => geometryFor(entry, draft.tileColumns ?? DEFAULT_TILES, draft.tileRows ?? DEFAULT_TILES),
    [entry, draft.tileColumns, draft.tileRows],
  );

  const commit = (next: Animation) => {
    setDraft(next);
    const result = animationSchema.safeParse(next);
    if (result.success) {
      setAnimations(path, [result.data]);
    }
  };

  return {
    draft,
    entry,
    geometry,
    handlers: makeHandlers({ commit, draft, entry }),
    url: `/${manifest?.root}/${path}`,
  };
};
