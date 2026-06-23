import type { Animation, ManifestEntry } from "../metadata/schema.ts";
import {
  allFrames,
  defaultAnimation,
  geometryFor,
  moveFrames,
  toggleMember,
  uniqueAnimationName,
} from "./frames.ts";

const FIRST = 0;
const ONE = 1;
const DEFAULT_TILES = 1;

export type AnimationHandlers = {
  setName: (name: string) => void;
  setFrameRate: (frameRate: number) => void;
  setRepeat: (repeat: number) => void;
  setYoyo: (yoyo: boolean) => void;
  setTileColumns: (columns: number) => void;
  setTileRows: (rows: number) => void;
  moveFrames: (positions: number[], target: number) => void;
  toggleExcluded: (frame: number) => void;
  resetFrames: () => void;
  selectAnimation: (index: number) => void;
  addAnimation: () => void;
  removeAnimation: (index: number) => void;
};

export type HandlerContext = {
  animations: Animation[];
  activeIndex: number;
  entry: ManifestEntry | undefined;
  setAnimations: (animations: Animation[]) => void;
  setActiveIndex: (index: number) => void;
  persist: (animations: Animation[]) => void;
};

const draftOf = (context: HandlerContext): Animation => context.animations[context.activeIndex];

const apply = (context: HandlerContext, animations: Animation[], index: number) => {
  context.setAnimations(animations);
  context.setActiveIndex(index);
  context.persist(animations);
};

const commit = (context: HandlerContext, next: Animation) => {
  const updated = context.animations.map((animation, index) => {
    if (index === context.activeIndex) {
      return next;
    }
    return animation;
  });
  context.setAnimations(updated);
  context.persist(updated);
};

const rescale = (context: HandlerContext, columns: number, rows: number): Animation => ({
  ...draftOf(context),
  excludedFrames: [],
  frameOrder: allFrames(geometryFor(context.entry, columns, rows)),
  tileColumns: columns,
  tileRows: rows,
});

const added = (context: HandlerContext) => {
  const base = defaultAnimation(context.entry);
  const created = { ...base, name: uniqueAnimationName(base.name, context.animations) };
  apply(context, [...context.animations, created], context.animations.length);
};

const removed = (context: HandlerContext, index: number) => {
  const remaining = context.animations.filter((_unused, position) => position !== index);
  const next = Math.min(context.activeIndex, remaining.length - ONE);
  apply(context, remaining, Math.max(FIRST, next));
};

export const makeHandlers = (context: HandlerContext): AnimationHandlers => {
  const draft = draftOf(context);
  const columns = draft.tileColumns ?? DEFAULT_TILES;
  const rows = draft.tileRows ?? DEFAULT_TILES;
  return {
    addAnimation: () => added(context),
    moveFrames: (positions, target) =>
      commit(context, {
        ...draft,
        frameOrder: moveFrames(draft.frameOrder, new Set(positions), target),
      }),
    removeAnimation: (index) => removed(context, index),
    resetFrames: () => commit(context, rescale(context, columns, rows)),
    selectAnimation: (index) => context.setActiveIndex(index),
    setFrameRate: (frameRate) => commit(context, { ...draft, frameRate }),
    setName: (name) => commit(context, { ...draft, name }),
    setRepeat: (repeat) => commit(context, { ...draft, repeat }),
    setTileColumns: (next) => commit(context, rescale(context, next, rows)),
    setTileRows: (next) => commit(context, rescale(context, columns, next)),
    setYoyo: (yoyo) => commit(context, { ...draft, yoyo }),
    toggleExcluded: (frame) =>
      commit(context, {
        ...draft,
        excludedFrames: toggleMember(draft.excludedFrames ?? [], frame),
      }),
  };
};
