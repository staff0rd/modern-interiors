import type { AssetMetadata, Metadata, Rect } from "./schema.ts";
import type { VariantIndex } from "./variantIndex.ts";
import { variantSize } from "./variantKey.ts";

const FALLBACK_RATIO = 1;
const NO_SIZE = 0;
const FIRST = 0;

const sizeRatio = (from: string, to: string): number => {
  const fromSize = variantSize(from);
  const toSize = variantSize(to);
  if (!fromSize || !toSize) {
    return FALLBACK_RATIO;
  }
  return toSize / fromSize;
};

const scaleRect = (rect: Rect, ratio: number): Rect => ({
  height: Math.round(rect.height * ratio),
  left: Math.round(rect.left * ratio),
  top: Math.round(rect.top * ratio),
  width: Math.round(rect.width * ratio),
});

const scaleCells = <Cells extends { cellHeight: number; cellWidth: number }>(
  value: Cells,
  ratio: number,
): Cells => ({
  ...value,
  cellHeight: Math.round(value.cellHeight * ratio),
  cellWidth: Math.round(value.cellWidth * ratio),
});

type SubSprites = AssetMetadata["subSprites"];
type Groups = AssetMetadata["subSpriteGroups"];
type Template = AssetMetadata["groupTemplate"];

const scaleSubSprites = (subs: SubSprites, ratio: number): SubSprites =>
  subs?.map((sub) => ({ ...sub, rect: scaleRect(sub.rect, ratio) }));

const scaleGroups = (groups: Groups, ratio: number): Groups =>
  groups?.map((group) => ({ ...scaleCells(group, ratio), rect: scaleRect(group.rect, ratio) }));

const scaleTemplate = (template: Template, ratio: number): Template =>
  template && scaleCells(template, ratio);

// Animations, descriptions, orientation and names copy verbatim; only pixel
// Geometry (rects + cell sizes) scales by the integer size ratio.
const deriveMetadata = (canonical: AssetMetadata, ratio: number): AssetMetadata => ({
  ...canonical,
  detached: undefined,
  groupTemplate: scaleTemplate(canonical.groupTemplate, ratio),
  subSpriteGroups: scaleGroups(canonical.subSpriteGroups, ratio),
  subSprites: scaleSubSprites(canonical.subSprites, ratio),
});

export type MetadataSource = "own" | "derived" | "none";

export type ResolvedMetadata = {
  meta: AssetMetadata;
  source: MetadataSource;
  canonicalPath: string | null;
  ratio: number;
  siblings: string[];
};

const compareSize = (left: number | null, right: number | null): number =>
  (left ?? NO_SIZE) - (right ?? NO_SIZE);

const isCanonicalCandidate = (path: string, metadata: Metadata): boolean => {
  const meta = metadata.assets[path];
  return meta !== undefined && !meta.detached;
};

const canonicalOf = (siblings: string[], metadata: Metadata): string | null => {
  const authored = siblings
    .filter((path) => isCanonicalCandidate(path, metadata))
    .sort(
      (left, right) =>
        compareSize(variantSize(left), variantSize(right)) || left.localeCompare(right),
    );
  return authored[FIRST] ?? null;
};

export type VariantRole = "canonical" | "detached" | "derived" | "none";

export type VariantMember = { path: string; size: number | null; role: VariantRole };

const roleOf = (path: string, metadata: Metadata, index: VariantIndex): VariantRole => {
  const own = metadata.assets[path];
  if (own) {
    if (own.detached) {
      return "detached";
    }
    return "canonical";
  }
  if (canonicalOf(index.siblings(path), metadata)) {
    return "derived";
  }
  return "none";
};

const toMember = (path: string, metadata: Metadata, index: VariantIndex): VariantMember => ({
  path,
  role: roleOf(path, metadata, index),
  size: variantSize(path),
});

export const variantMembers = (
  path: string,
  metadata: Metadata,
  index: VariantIndex,
): VariantMember[] =>
  index
    .siblings(path)
    .map((sibling) => toMember(sibling, metadata, index))
    .sort(
      (left, right) => compareSize(left.size, right.size) || left.path.localeCompare(right.path),
    );

const plainResult = (
  source: MetadataSource,
  meta: AssetMetadata,
  siblings: string[],
): ResolvedMetadata => ({ canonicalPath: null, meta, ratio: FALLBACK_RATIO, siblings, source });

type DerivedArgs = { path: string; canonicalPath: string; metadata: Metadata; siblings: string[] };

const derivedResult = ({
  path,
  canonicalPath,
  metadata,
  siblings,
}: DerivedArgs): ResolvedMetadata => {
  const ratio = sizeRatio(canonicalPath, path);
  const canonical = metadata.assets[canonicalPath] as AssetMetadata;
  return {
    canonicalPath,
    meta: deriveMetadata(canonical, ratio),
    ratio,
    siblings,
    source: "derived",
  };
};

export const resolveMetadata = (
  path: string,
  metadata: Metadata,
  index: VariantIndex,
): ResolvedMetadata => {
  const others = index.siblings(path).filter((sibling) => sibling !== path);
  const own = metadata.assets[path];
  if (own) {
    return plainResult("own", own, others);
  }
  const canonicalPath = canonicalOf(index.siblings(path), metadata);
  if (canonicalPath) {
    return derivedResult({ canonicalPath, metadata, path, siblings: others });
  }
  return plainResult("none", {}, others);
};
