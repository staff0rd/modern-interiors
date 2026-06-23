import { useCallback, useEffect, useState } from "react";

import { fetchManifest, fetchMetadata, saveMetadata } from "./api.ts";
import { errorMessage } from "./errorMessage.ts";
import type {
  Animation,
  AssetMetadata,
  GroupTemplate,
  Kind,
  Manifest,
  Metadata,
  Orientation,
  SubSprite,
  SubSpriteGroup,
} from "./schema.ts";

type LoadStatus = "loading" | "ready" | "error";
export type SaveState = "idle" | "saving" | "saved" | "error";

type PatchAsset = (path: string, patch: Partial<AssetMetadata>) => void;

type AssetSetters = {
  setKind: (path: string, kind: Kind) => void;
  setAnimations: (path: string, animations: Animation[]) => void;
  setDescription: (path: string, description: string | undefined) => void;
  setOrientation: (path: string, orientation: Orientation | undefined) => void;
  setSubSprites: (path: string, subSprites: SubSprite[]) => void;
  setSubSpriteGroups: (path: string, subSpriteGroups: SubSpriteGroup[]) => void;
  setGroupTemplate: (path: string, groupTemplate: GroupTemplate) => void;
};

export type MetadataStore = AssetSetters & {
  manifest: Manifest | null;
  metadata: Metadata | null;
  status: LoadStatus;
  error: string | null;
  saveState: SaveState;
};

const assetSetters = (patchAsset: PatchAsset): AssetSetters => ({
  setAnimations: (path, animations) => patchAsset(path, { animations }),
  setDescription: (path, description) => patchAsset(path, { description }),
  setGroupTemplate: (path, groupTemplate) => patchAsset(path, { groupTemplate }),
  setKind: (path, kind) => patchAsset(path, { kind }),
  setOrientation: (path, orientation) => patchAsset(path, { orientation }),
  setSubSpriteGroups: (path, subSpriteGroups) => patchAsset(path, { subSpriteGroups }),
  setSubSprites: (path, subSprites) => patchAsset(path, { subSprites }),
});

export const useMetadata = (): MetadataStore => {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    let active = true;
    Promise.all([fetchManifest(), fetchMetadata()])
      .then(([loadedManifest, loadedMetadata]) => {
        if (!active) {
          return;
        }
        setManifest(loadedManifest);
        setMetadata(loadedMetadata);
        setStatus("ready");
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        setError(errorMessage(cause, "Failed to load"));
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const patchAsset = useCallback((path: string, patch: Partial<AssetMetadata>) => {
    setMetadata((current) => {
      if (!current) {
        return current;
      }
      const existing = current.assets[path] ?? {};
      const next: Metadata = {
        ...current,
        assets: { ...current.assets, [path]: { ...existing, ...patch } },
      };
      setSaveState("saving");
      saveMetadata(next)
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("error"));
      return next;
    });
  }, []);

  return {
    error,
    manifest,
    metadata,
    saveState,
    status,
    ...assetSetters(patchAsset),
  };
};
