import { useRef, useState } from "react";

import type { PickHandler } from "./GenerateScene.ts";
import type { PaintMap } from "./tileset.ts";

const EMPTY: PaintMap = {};

export type Paint = {
  paint: PaintMap;
  onPick: PickHandler;
  clear: () => void;
};

export const usePaint = (selected: number): Paint => {
  const [paint, setPaint] = useState<PaintMap>(EMPTY);
  const ref = useRef(selected);
  ref.current = selected;
  const onPick: PickHandler = (at) => setPaint((current) => ({ ...current, [at]: ref.current }));
  const clear = () => setPaint(EMPTY);
  return { clear, onPick, paint };
};
