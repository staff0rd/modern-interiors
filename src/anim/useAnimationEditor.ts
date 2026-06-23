import { useMemo, useState } from "react";

import { animationSchema, type Animation, type ManifestEntry } from "../metadata/schema.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";
import { makeHandlers, type AnimationHandlers } from "./animationHandlers.ts";
import { defaultAnimation, geometryFor, type FrameGridGeometry } from "./frames.ts";

const FIRST = 0;
const DEFAULT_TILES = 1;

export type AnimationEditorState = {
  entry: ManifestEntry | undefined;
  geometry: FrameGridGeometry | null;
  url: string;
  animations: Animation[];
  activeIndex: number;
  draft: Animation;
  handlers: AnimationHandlers;
};

const initialAnimations = (
  existing: Animation[] | undefined,
  entry: ManifestEntry | undefined,
): Animation[] => {
  if (existing && existing.length > FIRST) {
    return existing;
  }
  return [defaultAnimation(entry)];
};

export const useAnimationEditor = (store: MetadataStore, path: string): AnimationEditorState => {
  const { manifest, metadata, setAnimations: persistAnimations } = store;
  const entry = manifest?.entries.find((candidate) => candidate.path === path);
  const existing = metadata?.assets[path]?.animations;
  const [animations, setAnimations] = useState<Animation[]>(() =>
    initialAnimations(existing, entry),
  );
  const [activeIndex, setActiveIndex] = useState(FIRST);
  const draft = animations[activeIndex];
  const geometry = useMemo(
    () => geometryFor(entry, draft.tileColumns ?? DEFAULT_TILES, draft.tileRows ?? DEFAULT_TILES),
    [entry, draft.tileColumns, draft.tileRows],
  );

  const persist = (next: Animation[]) => {
    const valid = next.filter((animation) => animationSchema.safeParse(animation).success);
    persistAnimations(path, valid);
  };

  return {
    activeIndex,
    animations,
    draft,
    entry,
    geometry,
    handlers: makeHandlers({
      activeIndex,
      animations,
      entry,
      persist,
      setActiveIndex,
      setAnimations,
    }),
    url: `/${manifest?.root}/${path}`,
  };
};
