import { geometryFor, type FrameGridGeometry } from "../anim/frames.ts";
import { groupCells } from "../sheet/groupCells.ts";
import { addFrame, type AtlasFrame, type FrameRect, hasText, NAME_SEP } from "./atlasFrame.ts";
import type {
  Animation,
  AssetMetadata,
  AutotileTag,
  Kind,
  ManifestEntry,
  SubSpriteGroup,
} from "./schema.ts";

const DEFAULT_TILES = 1;
const EMPTY = 0;
const ORIGIN = 0;
const SINGLE_FRAME = "sprite";

export type FrameAnim = {
  key: string;
  frames: string[];
  frameRate: number;
  repeat: number;
  yoyo: boolean;
};

export type Built = { anims: FrameAnim[]; frames: AtlasFrame[] };

const animFrameName = (animationName: string, index: number): string =>
  `${animationName}${NAME_SEP}f${index}`;

const playedOrder = (animation: Animation, geometry: FrameGridGeometry): number[] => {
  const excluded = new Set(animation.excludedFrames ?? []);
  return animation.frameOrder.filter((index) => !excluded.has(index) && index < geometry.total);
};

const frameRect = (geometry: FrameGridGeometry, index: number): FrameRect => ({
  height: geometry.frameHeight,
  left: (index % geometry.columns) * geometry.frameWidth,
  top: Math.floor(index / geometry.columns) * geometry.frameHeight,
  width: geometry.frameWidth,
});

const toAnim = (animation: Animation, order: number[]): FrameAnim => ({
  frameRate: animation.frameRate,
  frames: order.map((index) => animFrameName(animation.name, index)),
  key: animation.name,
  repeat: animation.repeat,
  yoyo: animation.yoyo ?? false,
});

const animGeometry = (entry: ManifestEntry, animation: Animation): FrameGridGeometry | null =>
  geometryFor(entry, animation.tileColumns ?? DEFAULT_TILES, animation.tileRows ?? DEFAULT_TILES);

const buildAnimation = (
  entry: ManifestEntry,
  animation: Animation,
  frames: Map<string, AtlasFrame>,
): FrameAnim | null => {
  const geometry = animGeometry(entry, animation);
  if (!geometry) {
    return null;
  }
  const order = playedOrder(animation, geometry);
  if (order.length === EMPTY) {
    return null;
  }
  for (const index of order) {
    addFrame(frames, animFrameName(animation.name, index), frameRect(geometry, index));
  }
  return toAnim(animation, order);
};

const buildAnimations = (
  entry: ManifestEntry,
  animations: Animation[],
  frames: Map<string, AtlasFrame>,
): FrameAnim[] =>
  animations
    .map((animation) => buildAnimation(entry, animation, frames))
    .filter((anim): anim is FrameAnim => anim !== null);

const buildSingleFrame = (
  entry: ManifestEntry,
  meta: AssetMetadata,
  frames: Map<string, AtlasFrame>,
): boolean => {
  if (!hasText(meta.description) && !meta.orientation) {
    return false;
  }
  addFrame(frames, SINGLE_FRAME, {
    height: entry.height,
    left: ORIGIN,
    top: ORIGIN,
    width: entry.width,
  });
  return true;
};

const autotileFrameName = (tag: AutotileTag): string => `${tag.layer}${NAME_SEP}${tag.mask}`;

const addGroupFrames = (group: SubSpriteGroup, frames: Map<string, AtlasFrame>): void => {
  for (const cell of groupCells(group)) {
    if (hasText(cell.name)) {
      addFrame(frames, `${group.name}${NAME_SEP}${cell.name}`, cell.rect);
    }
    if (cell.autotile) {
      addFrame(frames, `${group.name}${NAME_SEP}${autotileFrameName(cell.autotile)}`, cell.rect);
    }
  }
};

const buildSheetFrames = (meta: AssetMetadata, frames: Map<string, AtlasFrame>): void => {
  for (const sub of meta.subSprites ?? []) {
    addFrame(frames, sub.name, sub.rect);
  }
  for (const group of meta.subSpriteGroups ?? []) {
    addGroupFrames(group, frames);
  }
};

export const buildByKind = (
  entry: ManifestEntry,
  meta: AssetMetadata,
  kind: Kind,
): Built | null => {
  const frames = new Map<string, AtlasFrame>();
  if (kind === "animation") {
    return {
      anims: buildAnimations(entry, meta.animations ?? [], frames),
      frames: [...frames.values()],
    };
  }
  if (kind === "single") {
    if (!buildSingleFrame(entry, meta, frames)) {
      return null;
    }
    return { anims: [], frames: [...frames.values()] };
  }
  buildSheetFrames(meta, frames);
  return { anims: [], frames: [...frames.values()] };
};
