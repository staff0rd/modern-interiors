import {
  manifestSchema,
  metadataSchema,
  paintReferenceSchema,
  tilesDbSchema,
  type Manifest,
  type Metadata,
  type PaintReference,
  type TilesDb,
} from "./schema.ts";

const HTTP_NOT_FOUND = 404;

export const fetchManifest = async (): Promise<Manifest> => {
  const response = await fetch("/api/manifest");
  if (!response.ok) {
    throw new Error(`Failed to load manifest (${response.status})`);
  }
  return manifestSchema.parse(await response.json());
};

export const fetchMetadata = async (): Promise<Metadata> => {
  const response = await fetch("/api/metadata");
  if (!response.ok) {
    throw new Error(`Failed to load metadata (${response.status})`);
  }
  return metadataSchema.parse(await response.json());
};

export const fetchTiles = async (): Promise<TilesDb> => {
  const response = await fetch("/api/tiles");
  if (!response.ok) {
    throw new Error(`Failed to load tiles (${response.status})`);
  }
  return tilesDbSchema.parse(await response.json());
};

export const saveMetadata = async (metadata: Metadata): Promise<void> => {
  const response = await fetch("/api/metadata", {
    body: JSON.stringify(metadata),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error((detail as { error?: string }).error ?? `Save failed (${response.status})`);
  }
};

export const fetchPaint = async (): Promise<PaintReference | null> => {
  const response = await fetch("/api/paint");
  if (response.status === HTTP_NOT_FOUND) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to load paint (${response.status})`);
  }
  return paintReferenceSchema.parse(await response.json());
};

export const savePaint = async (reference: PaintReference): Promise<void> => {
  const response = await fetch("/api/paint", {
    body: JSON.stringify(reference),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error((detail as { error?: string }).error ?? `Save failed (${response.status})`);
  }
};
