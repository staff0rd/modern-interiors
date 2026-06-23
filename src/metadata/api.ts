import { manifestSchema, metadataSchema, type Manifest, type Metadata } from "./schema.ts";

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
