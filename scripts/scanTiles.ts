import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { hashTileCell, TILE_SIZE } from "./hashTileCell.ts";
import {
  manifestSchema,
  METADATA_VERSION,
  type ManifestEntry,
  type TileOccurrence,
  type TilesDb,
  tilesDbSchema,
} from "../src/metadata/schema.ts";

const PACK_ROOT = "moderninteriors-win";
const DECODE_MAX_BUFFER = 67_108_864;
const JSON_INDENT = 2;
const COUNT_START = 0;

const execFileAsync = promisify(execFile);

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "..");
const assetDir = join(repoRoot, "public", PACK_ROOT);
const manifestPath = join(repoRoot, "metadata", "manifest.json");
const outputPath = join(repoRoot, "metadata", "tiles.json");

type FileTiles = { hash: string; occurrence: TileOccurrence }[];

const is16x16Frame = (entry: ManifestEntry): boolean =>
  entry.kind !== "animation" && entry.frameWidth === TILE_SIZE && entry.frameHeight === TILE_SIZE;

const decodeRgba = async (path: string): Promise<Buffer> => {
  const fullPath = join(assetDir, path);
  const { stdout } = await execFileAsync("convert", [fullPath, "-depth", "8", "RGBA:-"], {
    encoding: "buffer",
    maxBuffer: DECODE_MAX_BUFFER,
  });
  return stdout;
};

const hashFile = async (entry: ManifestEntry): Promise<FileTiles> => {
  const rgba = await decodeRgba(entry.path);
  const rows = Math.floor(entry.height / TILE_SIZE);
  const cols = Math.floor(entry.width / TILE_SIZE);
  const tiles: FileTiles = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const hash = hashTileCell({ col, imageWidth: entry.width, rgba, row });
      if (hash !== null) {
        tiles.push({ hash, occurrence: { col, path: entry.path, row } });
      }
    }
  }
  return tiles;
};

const mapPooled = async <Item, Result>(
  items: Item[],
  limit: number,
  worker: (item: Item) => Promise<Result>,
): Promise<Result[]> => {
  const results = new Array<Result>(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
};

const accumulate = (perFile: FileTiles[]): Map<string, TileOccurrence[]> => {
  const byHash = new Map<string, TileOccurrence[]>();
  for (const fileTiles of perFile) {
    for (const { hash, occurrence } of fileTiles) {
      const existing = byHash.get(hash);
      if (existing) {
        existing.push(occurrence);
      } else {
        byHash.set(hash, [occurrence]);
      }
    }
  }
  return byHash;
};

const toSortedTiles = (byHash: Map<string, TileOccurrence[]>): Record<string, TileOccurrence[]> => {
  const tiles: Record<string, TileOccurrence[]> = {};
  for (const hash of [...byHash.keys()].sort()) {
    tiles[hash] = byHash.get(hash) ?? [];
  }
  return tiles;
};

const printSummary = (filesScanned: number, totalTiles: number, uniqueTiles: number): void => {
  console.log(`Files scanned:         ${filesScanned}`);
  console.log(`Total tiles:           ${totalTiles}`);
  console.log(`Unique tiles:          ${uniqueTiles}`);
  console.log(`Duplicate occurrences: ${totalTiles - uniqueTiles}`);
};

const main = async (): Promise<void> => {
  const manifest = manifestSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")));
  const entries = manifest.entries.filter(is16x16Frame);

  const perFile = await mapPooled(entries, availableParallelism(), hashFile);
  const byHash = accumulate(perFile);

  const tilesDb: TilesDb = tilesDbSchema.parse({
    generatedAt: new Date().toISOString(),
    root: PACK_ROOT,
    tiles: toSortedTiles(byHash),
    version: METADATA_VERSION,
  });

  await writeFile(outputPath, `${JSON.stringify(tilesDb, null, JSON_INDENT)}\n`);

  const totalTiles = perFile.reduce((sum, fileTiles) => sum + fileTiles.length, COUNT_START);
  printSummary(entries.length, totalTiles, byHash.size);
};

await main();
