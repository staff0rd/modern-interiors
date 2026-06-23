import { useState } from "react";

import { subSpriteSchema, type ManifestEntry, type SubSprite } from "../metadata/schema.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";

const NONE = -1;
const FIRST = 0;
const ORIGIN = 0;
const DEFAULT_RECT = 32;
const MAX_DISPLAY = 640;
const MIN_SCALE = 1;
const MAX_UPSCALE = 6;

export type Rect = SubSprite["rect"];

type SheetHandlers = {
  add: () => void;
  draw: (rect: Rect) => void;
  remove: (index: number) => void;
  select: (index: number) => void;
  setName: (index: number, name: string) => void;
  setDescription: (index: number, description: string) => void;
  setRect: (index: number, rect: Rect) => void;
};

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

const describe = (description: string): string | undefined => {
  if (description.trim().length > FIRST) {
    return description;
  }
  return undefined;
};

const defaultRect = (entry: ManifestEntry | undefined): Rect => ({
  height: Math.min(entry?.frameHeight ?? DEFAULT_RECT, entry?.height ?? DEFAULT_RECT),
  left: ORIGIN,
  top: ORIGIN,
  width: Math.min(entry?.frameWidth ?? DEFAULT_RECT, entry?.width ?? DEFAULT_RECT),
});

export const useSheetEditor = (store: MetadataStore, path: string): SheetEditorState => {
  const { manifest, metadata, setSubSprites: persistSubSprites } = store;
  const entry = manifest?.entries.find((candidate) => candidate.path === path);
  const existing = metadata?.assets[path]?.subSprites;
  const [subSprites, setSubSprites] = useState<SubSprite[]>(() => existing ?? []);
  const [selectedIndex, setSelectedIndex] = useState(NONE);

  const commit = (next: SubSprite[]) => {
    setSubSprites(next);
    persistSubSprites(
      path,
      next.filter((subSprite) => subSpriteSchema.safeParse(subSprite).success),
    );
  };

  const append = (rect: Rect) => {
    const index = subSprites.length;
    commit([...subSprites, { name: "", rect }]);
    setSelectedIndex(index);
  };

  const updateAt = (index: number, patch: Partial<SubSprite>) =>
    commit(
      subSprites.map((subSprite, at) => {
        if (at === index) {
          return { ...subSprite, ...patch };
        }
        return subSprite;
      }),
    );

  return {
    entry,
    handlers: {
      add: () => append(defaultRect(entry)),
      draw: (rect) => append(rect),
      remove: (index) => {
        commit(subSprites.filter((_unused, at) => at !== index));
        setSelectedIndex(NONE);
      },
      select: setSelectedIndex,
      setDescription: (index, description) =>
        updateAt(index, { description: describe(description) }),
      setName: (index, name) => updateAt(index, { name }),
      setRect: (index, rect) => updateAt(index, { rect }),
    },
    scale: displayScale(entry),
    selectedIndex,
    subSprites,
    url: `/${manifest?.root}/${path}`,
  };
};
