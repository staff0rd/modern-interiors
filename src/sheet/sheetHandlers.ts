import { subSpriteSchema, type ManifestEntry, type SubSprite } from "../metadata/schema.ts";
import { detectedSubSprites, type DetectedCell } from "./detectOccupiedCells.ts";

type Rect = SubSprite["rect"];

const NONE = -1;
const ORIGIN = 0;
const STEP = 1;
const DEFAULT_RECT = 32;

export type SheetHandlers = {
  add: () => void;
  autoDetect: (cells: DetectedCell[], groupRects: Rect[], replace: boolean) => number;
  draw: (rect: Rect) => void;
  remove: (index: number) => void;
  select: (index: number) => void;
  deselect: () => void;
  prev: () => void;
  next: () => void;
  setName: (index: number, name: string) => void;
  setDescription: (index: number, description: string) => void;
  setRect: (index: number, rect: Rect) => void;
};

export type SheetContext = {
  subSprites: SubSprite[];
  entry: ManifestEntry | undefined;
  selectedIndex: number;
  setSubSprites: (subSprites: SubSprite[]) => void;
  setSelectedIndex: (index: number) => void;
  persist: (subSprites: SubSprite[]) => void;
};

const stepSelection = (context: SheetContext, delta: number) => {
  const count = context.subSprites.length;
  if (count === ORIGIN) {
    return;
  }
  context.setSelectedIndex((context.selectedIndex + delta + count) % count);
};

const describe = (description: string): string | undefined => {
  if (description.trim().length > ORIGIN) {
    return description;
  }
  return undefined;
};

const retained = (subSprites: SubSprite[], replace: boolean): SubSprite[] => {
  if (replace) {
    return [];
  }
  return subSprites;
};

const defaultRect = (entry: ManifestEntry | undefined): Rect => ({
  height: Math.min(entry?.frameHeight ?? DEFAULT_RECT, entry?.height ?? DEFAULT_RECT),
  left: ORIGIN,
  top: ORIGIN,
  width: Math.min(entry?.frameWidth ?? DEFAULT_RECT, entry?.width ?? DEFAULT_RECT),
});

const commit = (context: SheetContext, next: SubSprite[]) => {
  context.setSubSprites(next);
  context.persist(next.filter((subSprite) => subSpriteSchema.safeParse(subSprite).success));
};

const append = (context: SheetContext, rect: Rect) => {
  commit(context, [...context.subSprites, { name: "", rect }]);
  context.setSelectedIndex(context.subSprites.length);
};

type DetectRequest = { cells: DetectedCell[]; groupRects: Rect[]; replace: boolean };

const autoDetectInto = (context: SheetContext, request: DetectRequest): number => {
  const kept = retained(context.subSprites, request.replace);
  const fresh = detectedSubSprites(request.cells, [
    ...request.groupRects,
    ...kept.map((sub) => sub.rect),
  ]);
  commit(context, [...kept, ...fresh]);
  context.setSelectedIndex(NONE);
  return fresh.length;
};

const updateAt = (context: SheetContext, index: number, patch: Partial<SubSprite>) =>
  commit(
    context,
    context.subSprites.map((subSprite, at) => {
      if (at === index) {
        return { ...subSprite, ...patch };
      }
      return subSprite;
    }),
  );

const removeAt = (context: SheetContext, index: number) => {
  commit(
    context,
    context.subSprites.filter((_unused, at) => at !== index),
  );
  context.setSelectedIndex(NONE);
};

export const makeSheetHandlers = (context: SheetContext): SheetHandlers => ({
  add: () => append(context, defaultRect(context.entry)),
  autoDetect: (cells, groupRects, replace) =>
    autoDetectInto(context, { cells, groupRects, replace }),
  deselect: () => context.setSelectedIndex(NONE),
  draw: (rect) => append(context, rect),
  next: () => stepSelection(context, STEP),
  prev: () => stepSelection(context, -STEP),
  remove: (index) => removeAt(context, index),
  select: context.setSelectedIndex,
  setDescription: (index, description) =>
    updateAt(context, index, { description: describe(description) }),
  setName: (index, name) => updateAt(context, index, { name }),
  setRect: (index, rect) => updateAt(context, index, { rect }),
});
