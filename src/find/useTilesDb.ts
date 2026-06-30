import { useEffect, useState } from "react";

import { fetchTiles } from "../metadata/api.ts";
import { errorMessage } from "../metadata/errorMessage.ts";
import type { TilesDb } from "../metadata/schema.ts";

export type TilesState =
  | { status: "loading" }
  | { error: string; status: "error" }
  | { db: TilesDb; status: "ready" };

export const useTilesDb = (): TilesState => {
  const [state, setState] = useState<TilesState>({ status: "loading" });
  useEffect(() => {
    let active = true;
    fetchTiles()
      .then((db) => {
        if (active) {
          setState({ db, status: "ready" });
        }
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
