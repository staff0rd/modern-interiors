import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { generateFiles } from "../src/metadata/generate.ts";
import { emptyMetadata, manifestSchema, metadataSchema } from "../src/metadata/schema.ts";

const SEP = "/";

export const GENERATED_DIR = join(process.cwd(), "public", "generated");
const MANIFEST_FILE = join(process.cwd(), "metadata", "manifest.json");
const METADATA_FILE = join(process.cwd(), "metadata", "metadata.json");

const readMetadata = async () => {
  const raw = await readFile(METADATA_FILE, "utf8").catch(() => null);
  if (raw === null) {
    return emptyMetadata();
  }
  return metadataSchema.parse(JSON.parse(raw));
};

export const writeGeneratedTree = async (): Promise<number> => {
  const manifest = manifestSchema.parse(JSON.parse(await readFile(MANIFEST_FILE, "utf8")));
  const files = generateFiles(manifest, await readMetadata());
  await rm(GENERATED_DIR, { force: true, recursive: true });
  await Promise.all(
    files.map(async (file) => {
      const dest = join(GENERATED_DIR, ...file.path.split(SEP));
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, file.content);
    }),
  );
  return files.length;
};
