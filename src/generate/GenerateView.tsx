import Phaser from "phaser";
import { useEffect, useMemo, useRef, useState } from "react";

import type { MetadataStore } from "../metadata/useMetadata.ts";
import { GenerateScene, type SceneConfig } from "./GenerateScene.ts";
import { styles } from "./generateStyles.ts";
import { GenerateToolbar } from "./GenerateToolbar.tsx";
import { TileInspector } from "./TileInspector.tsx";
import { wallGroup } from "./tileSheet.ts";
import { type AutotileLookup, buildAutotileLookup, type PaintMap } from "./tileset.ts";
import { usePaint } from "./usePaint.ts";

const ZERO = 0;
const FOOTPRINT_COLS = 32;
const FOOTPRINT_ROWS = 20;
const SEED_MAX = 1_000_000;

const newSeed = (): number => Math.floor(Math.random() * SEED_MAX);

type Layers = { showTiles: boolean; showRooms: boolean };

type ConfigInput = { seed: number; layers: Layers; lookup: AutotileLookup; paint: PaintMap };

const config = ({ seed, layers, lookup, paint }: ConfigInput): SceneConfig => ({
  cols: FOOTPRINT_COLS,
  lookup,
  paint,
  rows: FOOTPRINT_ROWS,
  seed,
  showRooms: layers.showRooms,
  showTiles: layers.showTiles,
});

const INITIAL_LAYERS: Layers = { showRooms: false, showTiles: true };

export const GenerateView = ({ store }: { store: MetadataStore }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GenerateScene | null>(null);
  const [seed, setSeed] = useState(newSeed);
  const [layers, setLayers] = useState<Layers>(INITIAL_LAYERS);
  const [selected, setSelected] = useState(ZERO);
  const lookup = useMemo(() => buildAutotileLookup(wallGroup(store.metadata)), [store.metadata]);
  const { paint, onPick, clear } = usePaint(selected);

  useEffect(() => {
    const scene = new GenerateScene(config({ layers, lookup, paint, seed }), onPick);
    sceneRef.current = scene;
    const game = new Phaser.Game({
      backgroundColor: "#16171d",
      parent: containerRef.current ?? undefined,
      pixelArt: true,
      scale: { height: "100%", mode: Phaser.Scale.RESIZE, width: "100%" },
      scene,
      type: Phaser.AUTO,
    });
    return () => {
      sceneRef.current = null;
      game.destroy(true);
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.configure(config({ layers, lookup, paint, seed }));
  }, [seed, layers, lookup, paint]);

  return (
    <div style={styles.page}>
      <GenerateToolbar
        seed={seed}
        onSeed={setSeed}
        onRegenerate={() => {
          clear();
          setSeed(newSeed());
        }}
        showTiles={layers.showTiles}
        onTiles={(showTiles) => setLayers((current) => ({ ...current, showTiles }))}
        showRooms={layers.showRooms}
        onRooms={(showRooms) => setLayers((current) => ({ ...current, showRooms }))}
      />
      <div style={styles.body}>
        <div ref={containerRef} style={styles.canvas} />
        <TileInspector store={store} selected={selected} onSelect={setSelected} onClear={clear} />
      </div>
    </div>
  );
};
