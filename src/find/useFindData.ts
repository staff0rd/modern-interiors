import { useEffect, useState } from "react";

import { fetchManifest, fetchTiles } from "../metadata/api.ts";
import { errorMessage } from "../metadata/errorMessage.ts";
import type { TilesDb } from "../metadata/schema.ts";
import type { SheetSize } from "./TileThumb.tsx";

export type FindData = {
  db: TilesDb;
  root: string;
  sheets: Map<string, SheetSize>;
};

export type FindState =
  | { status: "loading" }
  | { error: string; status: "error" }
  | { data: FindData; status: "ready" };

export const useFindData = (): FindState => {
  const [state, setState] = useState<FindState>({ status: "loading" });
  useEffect(() => {
    let active = true;
    Promise.all([fetchTiles(), fetchManifest()])
      .then(([db, manifest]) => {
        if (!active) {
          return;
        }
        const sheets = new Map(
          manifest.entries.map((entry) => [
            entry.path,
            { height: entry.height, width: entry.width },
          ]),
        );
        setState({ data: { db, root: db.root, sheets }, status: "ready" });
      })
      .catch((cause: unknown) => {
        if (active) {
          setState({ error: errorMessage(cause, "failed to load tiles"), status: "error" });
        }
      });
    return () => {
      active = false;
    };
  }, []);
  return state;
};
