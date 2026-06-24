import { useState } from "react";

import type { ManifestEntry, SubSprite } from "../metadata/schema.ts";
import { useDebouncedCallback } from "../metadata/useDebouncedCallback.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";
import { makeSheetHandlers, type SheetHandlers } from "./sheetHandlers.ts";
import { useParamSelection } from "./useParamSelection.ts";

const SUB_PARAM = "sub";
const MAX_DISPLAY = 640;
const MIN_SCALE = 1;
const MAX_UPSCALE = 6;

export type Rect = SubSprite["rect"];

export type SheetEditorState = {
  entry: ManifestEntry | undefined;
  url: string;
  scale: number;
  subSprites: SubSprite[];
  selectedIndex: number;
  handlers: SheetHandlers;
};

const displayScale = (entry: ManifestEntry | undefined): number => {
  if (!entry) {
    return MIN_SCALE;
  }
  const longest = Math.max(entry.width, entry.height);
  if (longest >= MAX_DISPLAY) {
    return MAX_DISPLAY / longest;
  }
  return Math.min(MAX_UPSCALE, Math.max(MIN_SCALE, Math.floor(MAX_DISPLAY / longest)));
};

export const useSheetEditor = (store: MetadataStore, path: string): SheetEditorState => {
  const { manifest, metadata, setSubSprites } = store;
  const entry = manifest?.entries.find((candidate) => candidate.path === path);
  const existing = metadata?.assets[path]?.subSprites;
  const [subSprites, setSubSpritesState] = useState<SubSprite[]>(() => existing ?? []);
  const [selectedIndex, setSelectedIndex] = useParamSelection(SUB_PARAM, subSprites.length);
  const persist = useDebouncedCallback((next: SubSprite[]) => setSubSprites(path, next));

  const handlers = makeSheetHandlers({
    entry,
    persist,
    selectedIndex,
    setSelectedIndex,
    setSubSprites: setSubSpritesState,
    subSprites,
  });

  return {
    entry,
    handlers,
    scale: displayScale(entry),
    selectedIndex,
    subSprites,
    url: `/${manifest?.root}/${path}`,
  };
};
