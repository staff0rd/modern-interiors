import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { hashTileCell } from "./hashTileCell.ts";
import { manifestSchema, type TileOccurrence, tilesDbSchema } from "../src/metadata/schema.ts";

const PACK_ROOT = "moderninteriors-win";
const DECODE_MAX_BUFFER = 67_108_864;
const ARG_OFFSET = 2;
const REQUIRED_ARGS = 3;
const RADIX = 10;
const EXIT_FAILURE = 1;

const execFileAsync = promisify(execFile);

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "..");
const assetDir = join(repoRoot, "public", PACK_ROOT);
const manifestPath = join(repoRoot, "metadata", "manifest.json");
const tilesPath = join(repoRoot, "metadata", "tiles.json");

const decodeRgba = async (fullPath: string): Promise<Buffer> => {
  const { stdout } = await execFileAsync("convert", [fullPath, "-depth", "8", "RGBA:-"], {
    encoding: "buffer",
    maxBuffer: DECODE_MAX_BUFFER,
  });
  return stdout;
};

const resolveImageWidth = async (image: string): Promise<number | null> => {
  const manifest = manifestSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")));
  const entry = manifest.entries.find((candidate) => candidate.path === image);
  return entry?.width ?? null;
};

const loadOccurrences = async (hash: string): Promise<TileOccurrence[]> => {
  const tilesDb = tilesDbSchema.parse(JSON.parse(await readFile(tilesPath, "utf8")));
  return tilesDb.tiles[hash] ?? [];
};

const printOccurrences = (hash: string, occurrences: TileOccurrence[]): void => {
  console.log(`Hash: ${hash}`);
  console.log(`Occurrences: ${occurrences.length}`);
  for (const occurrence of occurrences) {
    console.log(`  ${occurrence.path} [row ${occurrence.row}, col ${occurrence.col}]`);
  }
};

const fail = (message: string): void => {
  console.error(message);
  process.exitCode = EXIT_FAILURE;
};

const main = async (): Promise<void> => {
  const [image, rowArg, colArg] = process.argv.slice(ARG_OFFSET);
  if (process.argv.length - ARG_OFFSET !== REQUIRED_ARGS) {
    return fail("Usage: node scripts/findTile.ts <image> <row> <col>");
  }

  const imageWidth = await resolveImageWidth(image);
  if (imageWidth === null) {
    return fail(`Image not found in manifest: ${image}`);
  }

  const hash = hashTileCell({
    col: Number.parseInt(colArg, RADIX),
    imageWidth,
    rgba: await decodeRgba(join(assetDir, image)),
    row: Number.parseInt(rowArg, RADIX),
  });
  if (hash === null) {
    return fail(`Cell at row ${rowArg}, col ${colArg} is empty (black or transparent)`);
  }

  printOccurrences(hash, await loadOccurrences(hash));
};

await main();
