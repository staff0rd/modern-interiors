import { useEffect, useState } from "react";

import { detectCellSignatures } from "./detectOccupiedCells.ts";
import type { CellSignatures } from "./groupCells.ts";

const OCCUPANCY_THRESHOLD = 16;

export const useOccupancy = (
  url: string,
  cellWidth: number,
  cellHeight: number,
): CellSignatures | null => {
  const [signatures, setSignatures] = useState<CellSignatures | null>(null);

  useEffect(() => {
    let active = true;
    detectCellSignatures(url, {
      frameHeight: cellHeight,
      frameWidth: cellWidth,
      rgbThreshold: OCCUPANCY_THRESHOLD,
    })
      .then((map) => active && setSignatures(map))
      .catch(() => active && setSignatures(null));
    return () => {
      active = false;
    };
  }, [url, cellWidth, cellHeight]);

  return signatures;
};
