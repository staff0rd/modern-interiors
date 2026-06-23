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

export const inferKind = (relativePath: string): Kind => {
  const lower = relativePath.toLowerCase();
  const [topDir = ""] = relativePath.split("/");

  if (
    topDir === "3_Animated_objects" ||
    lower.includes("animation") ||
    lower.includes("animated")
  ) {
    return "animation";
  }

  if (lower.includes("single") || topDir === "6_Home_Designs" || topDir === "Palettes") {
    return "single";
  }

  return "spritesheet";
};
