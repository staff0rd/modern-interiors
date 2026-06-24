const SIZE_DIR = /^\d+x\d+$/;
const SIZE_TOKEN = /(?<size>\d+)x\d+/i;
const SIZE_TOKEN_ALL = /\d+x\d+/gi;
const EXTENSION = /\.[^.]+$/;
const SEPARATOR_RUN = /[ _]+/g;
const SEPARATOR_EDGE = /^_+|_+$/g;
const SEP = "/";
const LAST = -1;
const WIDTH_PART = 0;

const normalizeSegment = (segment: string): string =>
  segment.toLowerCase().replace(SEPARATOR_RUN, "_").replace(SEPARATOR_EDGE, "");

const contentSegments = (path: string): string[] =>
  path.split(SEP).filter((segment) => !SIZE_DIR.test(segment));

// Strip the extension and every NxN size token (the token can sit mid-name, e.g.
// Tileset_16x16_1), leaving the separator runs for normalizeSegment to collapse.
const stripSize = (file: string): string => file.replace(EXTENSION, "").replace(SIZE_TOKEN_ALL, "");

// Variants share a key once their size dir (16x16) and every filename NxN token
// Are removed and the remaining segments normalized (so "Old stuff" === "Old_Stuff"
// And Tileset_16x16_1 === Tileset_32x32_1).
export const variantKey = (path: string): string => {
  const segments = contentSegments(path);
  const name = stripSize(segments.pop() ?? path);
  return [...segments.map(normalizeSegment), normalizeSegment(name)].join(SEP);
};

const sizeFromFile = (file: string): number | null => {
  const match = SIZE_TOKEN.exec(file);
  if (match?.groups) {
    return Number(match.groups.size);
  }
  return null;
};

export const variantSize = (path: string): number | null => {
  const segments = path.split(SEP);
  const sizeDir = segments.find((segment) => SIZE_DIR.test(segment));
  if (sizeDir) {
    return Number(sizeDir.split("x")[WIDTH_PART]);
  }
  return sizeFromFile(segments.at(LAST) ?? path);
};
