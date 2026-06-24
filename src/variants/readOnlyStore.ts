import type { AssetMetadata, Metadata } from "../metadata/schema.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";

const NOOP = (): void => undefined;

const readOnlySetters = {
  detachVariant: NOOP,
  setAnimations: NOOP,
  setDescription: NOOP,
  setGroupTemplate: NOOP,
  setKind: NOOP,
  setOrientation: NOOP,
  setSubSpriteGroups: NOOP,
  setSubSprites: NOOP,
};

// A view of the store where `path` resolves to the derived (scaled) metadata and
// Every setter is inert, so an editor renders derived content but cannot mutate it.
export const readOnlyStore = (
  store: MetadataStore,
  path: string,
  meta: AssetMetadata,
): MetadataStore => {
  const base = store.metadata ?? { assets: {}, version: 1 };
  const metadata: Metadata = { ...base, assets: { ...base.assets, [path]: meta } };
  return { ...store, ...readOnlySetters, metadata };
};
