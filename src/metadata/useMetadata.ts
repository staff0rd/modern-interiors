import { useCallback, useEffect, useState } from "react";

import { fetchManifest, fetchMetadata, saveMetadata } from "./api.ts";
import { errorMessage } from "./errorMessage.ts";
import type { Animation, AssetMetadata, Kind, Manifest, Metadata } from "./schema.ts";

type LoadStatus = "loading" | "ready" | "error";
export type SaveState = "idle" | "saving" | "saved" | "error";

export type MetadataStore = {
  manifest: Manifest | null;
  metadata: Metadata | null;
  status: LoadStatus;
  error: string | null;
  saveState: SaveState;
  setKind: (path: string, kind: Kind) => void;
  setAnimations: (path: string, animations: Animation[]) => void;
};

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

  const setKind = useCallback(
    (path: string, kind: Kind) => patchAsset(path, { kind }),
    [patchAsset],
  );

  const setAnimations = useCallback(
    (path: string, animations: Animation[]) => patchAsset(path, { animations }),
    [patchAsset],
  );

  return { error, manifest, metadata, saveState, setAnimations, setKind, status };
};
