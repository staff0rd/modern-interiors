import type { CSSProperties } from "react";

import { inferAnimationName } from "../metadata/inferKind.ts";
import type { Animation, ManifestEntry } from "../metadata/schema.ts";

const DEFAULT_FRAME_RATE = 8;
const LOOP_FOREVER = -1;
const INSERT_NO_REMOVE = 0;
const SLICE_START = 0;
const TARGET_CELL_PX = 72;
const MIN_SCALE = 1;
const DEFAULT_TILES = 1;
const NO_ORDINAL = 0;
const FIRST_ORDINAL = 1;

export type FrameGridGeometry = {
  columns: number;
  rows: number;
  total: number;
  frameWidth: number;
  frameHeight: number;
};

export const frameGridGeometry = (
  entry: ManifestEntry,
  tileColumns: number,
  tileRows: number,
): FrameGridGeometry | null => {
  const { frameWidth, frameHeight, width, height } = entry;
  if (!frameWidth || !frameHeight) {
    return null;
  }
  const blockWidth = frameWidth * tileColumns;
  const blockHeight = frameHeight * tileRows;
  const columns = Math.floor(width / blockWidth);
  const rows = Math.floor(height / blockHeight);
  return { columns, frameHeight: blockHeight, frameWidth: blockWidth, rows, total: columns * rows };
};

const baseGeometry = (entry: ManifestEntry | undefined): FrameGridGeometry | null => {
  if (!entry) {
    return null;
  }
  return frameGridGeometry(entry, DEFAULT_TILES, DEFAULT_TILES);
};

export const allFrames = (geometry: FrameGridGeometry | null): number[] => {
  if (!geometry) {
    return [];
  }
  return Array.from({ length: geometry.total }, (_unused, index) => index);
};

export type FrameCrop = {
  geometry: FrameGridGeometry;
  index: number;
  url: string;
  scale: number;
};

export const frameCropStyle = ({ geometry, index, url, scale }: FrameCrop): CSSProperties => {
  const column = index % geometry.columns;
  const row = Math.floor(index / geometry.columns);
  return {
    backgroundImage: `url("${url}")`,
    backgroundPosition: `${-column * geometry.frameWidth * scale}px ${-row * geometry.frameHeight * scale}px`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${geometry.columns * geometry.frameWidth * scale}px ${geometry.rows * geometry.frameHeight * scale}px`,
    height: geometry.frameHeight * scale,
    imageRendering: "pixelated",
    width: geometry.frameWidth * scale,
  };
};

export const stripScale = (geometry: FrameGridGeometry): number => {
  const longest = Math.max(geometry.frameWidth, geometry.frameHeight);
  return Math.max(MIN_SCALE, Math.round(TARGET_CELL_PX / longest));
};

export const moveFrames = (order: number[], selected: Set<number>, target: number): number[] => {
  const moved = order.filter((_unused, position) => selected.has(position));
  const remaining = order.filter((_unused, position) => !selected.has(position));
  const before = order
    .slice(SLICE_START, target)
    .filter((_unused, position) => !selected.has(position));
  remaining.splice(before.length, INSERT_NO_REMOVE, ...moved);
  return remaining;
};

export const toggleMember = (values: number[], value: number): number[] => {
  if (values.includes(value)) {
    return values.filter((current) => current !== value);
  }
  return [...values, value];
};

export const playOrdinals = (frameOrder: number[], excluded: Set<number>): number[] => {
  let count = NO_ORDINAL;
  return frameOrder.map((frame) => {
    if (excluded.has(frame)) {
      return NO_ORDINAL;
    }
    count += FIRST_ORDINAL;
    return count;
  });
};

const nameFor = (entry: ManifestEntry | undefined): string => {
  if (!entry) {
    return "";
  }
  return inferAnimationName(entry.path);
};

export const defaultAnimation = (entry: ManifestEntry | undefined): Animation => ({
  excludedFrames: [],
  frameOrder: allFrames(baseGeometry(entry)),
  frameRate: DEFAULT_FRAME_RATE,
  name: nameFor(entry),
  repeat: LOOP_FOREVER,
  tileColumns: DEFAULT_TILES,
  tileRows: DEFAULT_TILES,
  yoyo: false,
});
