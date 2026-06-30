import { open, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { inferKind, parseFrameSize } from "../src/metadata/inferKind.ts";
import { manifestSchema, METADATA_VERSION, type ManifestEntry } from "../src/metadata/schema.ts";

const PACK_ROOT = "moderninteriors-win";
const ONLY_FRAME_SIZE = 16;
const PNG_HEADER_BYTES = 24;
const WIDTH_OFFSET = 16;
const HEIGHT_OFFSET = 20;
const CONCURRENCY = 128;
const BUFFER_OFFSET = 0;
const FILE_START = 0;
const JSON_INDENT = 2;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "..");
const assetDir = join(repoRoot, "public", PACK_ROOT);
const outputPath = join(repoRoot, "metadata", "manifest.json");

const walk = async (dir: string, found: string[]): Promise<void> => {
  const dirEntries = await readdir(dir, { withFileTypes: true });
  await Promise.all(
    dirEntries.map(async (dirEntry) => {
      const fullPath = join(dir, dirEntry.name);
      if (dirEntry.isDirectory()) {
        await walk(fullPath, found);
      } else if (dirEntry.isFile() && dirEntry.name.toLowerCase().endsWith(".png")) {
        found.push(fullPath);
      }
    }),
  );
};

const readDimensions = async (fullPath: string): Promise<{ width: number; height: number }> => {
  const handle = await open(fullPath, "r");
  try {
    const buffer = Buffer.alloc(PNG_HEADER_BYTES);
    await handle.read(buffer, BUFFER_OFFSET, PNG_HEADER_BYTES, FILE_START);
    return {
      height: buffer.readUInt32BE(HEIGHT_OFFSET),
      width: buffer.readUInt32BE(WIDTH_OFFSET),
    };
  } finally {
    await handle.close();
  }
};

const toEntry = async (fullPath: string): Promise<ManifestEntry> => {
  const path = relative(assetDir, fullPath).split("\\").join("/");
  const { width, height } = await readDimensions(fullPath);
  const frameSize = parseFrameSize(path);
  const frameHeight = frameSize?.frameHeight ?? null;
  const frameWidth = frameSize?.frameWidth ?? null;
  return {
    frameHeight,
    frameWidth,
    height,
    kind: inferKind(path, { frameHeight, frameWidth, height, width }),
    path,
    width,
  };
};

const mapPooled = async <Item>(
  items: string[],
  limit: number,
  worker: (item: string) => Promise<Item>,
): Promise<Item[]> => {
  const results = new Array<Item>(items.length);
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

const isAllowedFrameSize = (fullPath: string): boolean => {
  const path = relative(assetDir, fullPath).split("\\").join("/");
  const frameSize = parseFrameSize(path);
  if (!frameSize) {
    return true;
  }
  return frameSize.frameWidth === ONLY_FRAME_SIZE && frameSize.frameHeight === ONLY_FRAME_SIZE;
};

const main = async (): Promise<void> => {
  const allFiles: string[] = [];
  await walk(assetDir, allFiles);
  const files = allFiles.filter(isAllowedFrameSize);
  files.sort();

  const entries = await mapPooled(files, CONCURRENCY, toEntry);

  const manifest = manifestSchema.parse({
    entries,
    generatedAt: new Date().toISOString(),
    root: PACK_ROOT,
    version: METADATA_VERSION,
  });

  await writeFile(outputPath, `${JSON.stringify(manifest, null, JSON_INDENT)}\n`);
  console.log(`Scanned ${entries.length} PNGs -> ${relative(repoRoot, outputPath)}`);
};

await main();
