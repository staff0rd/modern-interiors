import { useEffect, useRef } from "react";

import { useParamSelection } from "./useParamSelection.ts";

const NONE = -1;

export const useTileSelection = (
  key: string,
  count: number,
  groupIndex: number,
): [number, (index: number) => void] => {
  const [selectedTileIndex, setSelectedTileIndex] = useParamSelection(key, count);
  const previousGroupIndex = useRef(groupIndex);
  useEffect(() => {
    if (previousGroupIndex.current !== groupIndex) {
      previousGroupIndex.current = groupIndex;
      setSelectedTileIndex(NONE);
    }
  }, [groupIndex, setSelectedTileIndex]);
  return [selectedTileIndex, setSelectedTileIndex];
};
