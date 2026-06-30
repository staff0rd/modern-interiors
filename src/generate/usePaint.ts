import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import { fetchPaint, savePaint } from "../metadata/api.ts";
import type { PickHandler } from "./GenerateScene.ts";
import type { PaintMap } from "./tileset.ts";

const EMPTY: PaintMap = {};
const SEED_MAX = 1_000_000;

const newSeed = (): number => Math.floor(Math.random() * SEED_MAX);

const NO_GROUP = undefined;

type Store = {
  seed: number;
  paint: PaintMap;
  wallGroup: string | undefined;
  wallSheet: string | undefined;
  ready: boolean;
  setSeed: (seed: number) => void;
  setPaint: Dispatch<SetStateAction<PaintMap>>;
  setWallGroup: (name: string | undefined) => void;
  setWallSheet: (name: string) => void;
};

const usePaintFile = (): Store => {
  const [seed, setSeed] = useState(newSeed);
  const [paint, setPaint] = useState<PaintMap>(EMPTY);
  const [wallGroup, setWallGroup] = useState<string | undefined>(NO_GROUP);
  const [wallSheet, setWallSheet] = useState<string | undefined>(NO_GROUP);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    fetchPaint()
      .then((reference) => {
        if (!active) {
          return;
        }
        if (reference) {
          setSeed(reference.seed);
          setPaint(reference.tiles);
          setWallGroup(reference.wallGroup);
          setWallSheet(reference.wallSheet);
        }
        setReady(true);
      })
      .catch(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (ready) {
      savePaint({ seed, tiles: paint, wallGroup, wallSheet }).catch(() => undefined);
    }
  }, [ready, seed, paint, wallGroup, wallSheet]);

  return {
    paint,
    ready,
    seed,
    setPaint,
    setSeed,
    setWallGroup,
    setWallSheet,
    wallGroup,
    wallSheet,
  };
};

export type Paint = {
  seed: number;
  paint: PaintMap;
  wallGroup: string | undefined;
  wallSheet: string | undefined;
  ready: boolean;
  onPick: PickHandler;
  setSeed: (seed: number) => void;
  setWallGroup: (name: string | undefined) => void;
  setWallSheet: (name: string) => void;
  regenerate: () => void;
  clear: () => void;
};

export const usePaint = (selected: string): Paint => {
  const store = usePaintFile();
  const brush = useRef(selected);
  brush.current = selected;
  const onPick: PickHandler = (at) =>
    brush.current && store.setPaint((current) => ({ ...current, [at]: brush.current }));
  const reset = (seed: number) => {
    store.setPaint(EMPTY);
    store.setSeed(seed);
  };
  return {
    clear: () => store.setPaint(EMPTY),
    onPick,
    paint: store.paint,
    ready: store.ready,
    regenerate: () => reset(newSeed()),
    seed: store.seed,
    setSeed: reset,
    setWallGroup: store.setWallGroup,
    setWallSheet: store.setWallSheet,
    wallGroup: store.wallGroup,
    wallSheet: store.wallSheet,
  };
};
