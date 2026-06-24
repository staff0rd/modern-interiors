import { buildByKind, type AtlasFrame, type FrameAnim } from "./generateFrames.ts";
import type { AssetMetadata, Kind, Manifest, ManifestEntry, Metadata } from "./schema.ts";
import { buildVariantIndex } from "./variantIndex.ts";
import { resolveMetadata } from "./variants.ts";

const ZERO = 0;
const ONE = 1;
const NO_SLASH = -1;
const SEP = "/";
const JSON_INDENT = 2;
const SCALE = "1";
const GLOBAL_TIME_SCALE = 1;
const PNG_EXT = /\.png$/i;

// TexturePacker frame rects use single-letter keys (x/y/w/h); computed from named
// Constants so they survive the id-length lint rule and the formatter's quote removal.
const KEY_X = "x";
const KEY_Y = "y";
const KEY_W = "w";
const KEY_H = "h";

export type GeneratedFile = { path: string; content: string };

const effectiveKind = (entry: ManifestEntry, meta: AssetMetadata): Kind => meta.kind ?? entry.kind;

const sizeObject = (width: number, height: number) => ({ [KEY_H]: height, [KEY_W]: width });

const dirOf = (path: string): string => {
  const cut = path.lastIndexOf(SEP);
  if (cut === NO_SLASH) {
    return "";
  }
  return path.slice(ZERO, cut);
};

const fileOf = (path: string): string => {
  const cut = path.lastIndexOf(SEP);
  if (cut === NO_SLASH) {
    return path;
  }
  return path.slice(cut + ONE);
};

const joinPrefix = (dir: string, base: string): string => {
  if (dir.length === ZERO) {
    return base;
  }
  return `${dir}${SEP}${base}`;
};

const atlasFrameEntry = (frame: AtlasFrame) => ({
  frame: { [KEY_H]: frame.height, [KEY_W]: frame.width, [KEY_X]: frame.left, [KEY_Y]: frame.top },
});

const atlasContent = (entry: ManifestEntry, pngUrl: string, frames: AtlasFrame[]): string => {
  const frameMap: Record<string, ReturnType<typeof atlasFrameEntry>> = {};
  for (const frame of frames) {
    frameMap[frame.name] = atlasFrameEntry(frame);
  }
  const atlas = {
    frames: frameMap,
    meta: { image: pngUrl, scale: SCALE, size: sizeObject(entry.width, entry.height) },
  };
  return `${JSON.stringify(atlas, null, JSON_INDENT)}\n`;
};

const animEntry = (textureKey: string, anim: FrameAnim) => ({
  frameRate: anim.frameRate,
  frames: anim.frames.map((frame) => ({ frame, key: textureKey })),
  key: anim.key,
  repeat: anim.repeat,
  type: "frame",
  yoyo: anim.yoyo,
});

const animsContent = (textureKey: string, anims: FrameAnim[]): string => {
  const data = {
    anims: anims.map((anim) => animEntry(textureKey, anim)),
    globalTimeScale: GLOBAL_TIME_SCALE,
  };
  return `${JSON.stringify(data, null, JSON_INDENT)}\n`;
};

const filesFor = (entry: ManifestEntry, meta: AssetMetadata, root: string): GeneratedFile[] => {
  const built = buildByKind(entry, meta, effectiveKind(entry, meta));
  if (!built || built.frames.length === ZERO) {
    return [];
  }
  const base = fileOf(entry.path).replace(PNG_EXT, "");
  const prefix = joinPrefix(dirOf(entry.path), base);
  const pngUrl = `${SEP}${root}${SEP}${entry.path}`;
  const files: GeneratedFile[] = [
    { content: atlasContent(entry, pngUrl, built.frames), path: `${prefix}.atlas.json` },
  ];
  if (built.anims.length > ZERO) {
    files.push({ content: animsContent(base, built.anims), path: `${prefix}.anims.json` });
  }
  return files;
};

export const generateFiles = (manifest: Manifest, metadata: Metadata): GeneratedFile[] => {
  const index = buildVariantIndex(manifest);
  const files: GeneratedFile[] = [];
  for (const entry of manifest.entries) {
    const resolved = resolveMetadata(entry.path, metadata, index);
    if (resolved.source !== "none") {
      files.push(...filesFor(entry, resolved.meta, manifest.root));
    }
  }
  return files;
};
