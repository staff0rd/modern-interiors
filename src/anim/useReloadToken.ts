import { useEffect, useRef, useState } from "react";

import type { SaveState } from "../metadata/useMetadata.ts";

const ZERO = 0;
const ONE = 1;

export const useReloadToken = (saveState: SaveState): number => {
  const [token, setToken] = useState(ZERO);
  const previous = useRef<SaveState>(saveState);

  useEffect(() => {
    if (saveState === "saved" && previous.current !== "saved") {
      setToken((value) => value + ONE);
    }
    previous.current = saveState;
  }, [saveState]);

  return token;
};
