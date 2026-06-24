import type { Manifest } from "./schema.ts";
import { variantKey } from "./variantKey.ts";

export type VariantIndex = { siblings: (path: string) => string[] };

const siblingsLookup =
  (byKey: Map<string, string[]>) =>
  (path: string): string[] =>
    byKey.get(variantKey(path)) ?? [path];

const indexCache = new WeakMap<Manifest, VariantIndex>();

// Cached by manifest identity: the manifest is fixed for the session, so the whole-pack
// Scan that groups size variants by key runs once rather than on every editor mount.
export const buildVariantIndex = (manifest: Manifest): VariantIndex => {
  const cached = indexCache.get(manifest);
  if (cached) {
    return cached;
  }
  const byKey = new Map<string, string[]>();
  for (const entry of manifest.entries) {
    const key = variantKey(entry.path);
    byKey.set(key, [...(byKey.get(key) ?? []), entry.path]);
  }
  const index = { siblings: siblingsLookup(byKey) };
  indexCache.set(manifest, index);
  return index;
};
