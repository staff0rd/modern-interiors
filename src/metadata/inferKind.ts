import type { Kind } from "./schema.ts";

const FRAME_SIZE_PATTERN = /(?<width>\d+)x(?<height>\d+)/i;
const FRAME_SIZE_SEGMENT = /^\d+x\d+$/;
const LAST_SEGMENT = -1;
const EXTENSION = /\.[^.]+$/;
const SIZE_SUFFIX = /_\d+x\d+$/i;

export const inferAnimationName = (relativePath: string): string => {
  const segments = relativePath.split("/");
  const fileName = segments.at(LAST_SEGMENT) ?? relativePath;
  return fileName.replace(EXTENSION, "").replace(SIZE_SUFFIX, "");
};

export type FrameSize = { frameWidth: number; frameHeight: number } | null;

export const parseFrameSize = (relativePath: string): FrameSize => {
  const segments = relativePath.split("/");
  const fileName = segments.at(LAST_SEGMENT) ?? relativePath;

  const fromName = FRAME_SIZE_PATTERN.exec(fileName);
  if (fromName?.groups) {
    return {
      frameHeight: Number(fromName.groups.height),
      frameWidth: Number(fromName.groups.width),
    };
  }

  const dirSegment = segments.find((segment) => FRAME_SIZE_SEGMENT.test(segment));
  if (dirSegment) {
    const [widthPart, heightPart] = dirSegment.split("x");
    return { frameHeight: Number(heightPart), frameWidth: Number(widthPart) };
  }

  return null;
};

const SINGLE_TILE = 1;

export type KindDimensions = {
  width: number;
  height: number;
  frameWidth: number | null;
  frameHeight: number | null;
};

// A design/palette image that holds more than one frame is really a tile sheet, not a
// Single sprite — so the directory guess only wins when we can't see multiple tiles.
const isMultiTile = (dims: KindDimensions | undefined): boolean => {
  if (!dims?.frameWidth || !dims?.frameHeight) {
    return false;
  }
  const cols = Math.floor(dims.width / dims.frameWidth);
  const rows = Math.floor(dims.height / dims.frameHeight);
  return cols * rows > SINGLE_TILE;
};

export const inferKind = (relativePath: string, dims?: KindDimensions): Kind => {
  const lower = relativePath.toLowerCase();
  const [topDir = ""] = relativePath.split("/");

  if (
    topDir === "3_Animated_objects" ||
    lower.includes("animation") ||
    lower.includes("animated")
  ) {
    return "animation";
  }

  // A "single"-named path is the pack author marking one object (which may still span
  // Several cells, e.g. a 16x32 chair), so it always stays single.
  if (lower.includes("single")) {
    return "single";
  }

  // A whole-design directory is a single arrangement unless the image is plainly a tile
  // Grid (e.g. a 528x480 layer at a 48x48 frame is 11x10 tiles), which makes it a sheet.
  const designDir = topDir === "6_Home_Designs" || topDir === "Palettes";
  if (designDir && !isMultiTile(dims)) {
    return "single";
  }

  return "spritesheet";
};
