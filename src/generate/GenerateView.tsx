import Phaser from "phaser";
import { useEffect, useMemo, useRef, useState } from "react";

import type { MetadataStore } from "../metadata/useMetadata.ts";
import { GenerateScene, type SceneConfig } from "./GenerateScene.ts";
import { styles } from "./generateStyles.ts";
import { GenerateToolbar } from "./GenerateToolbar.tsx";
import { TileInspector } from "./TileInspector.tsx";
import { wallGroup } from "./tileSheet.ts";
import { type AutotileLookup, buildAutotileLookup } from "./tileset.ts";

const ZERO = 0;
const FOOTPRINT_COLS = 32;
const FOOTPRINT_ROWS = 20;
const SEED_MAX = 1_000_000;

const newSeed = (): number => Math.floor(Math.random() * SEED_MAX);

type Layers = { showTiles: boolean; showRooms: boolean };

const config = (seed: number, layers: Layers, lookup: AutotileLookup): SceneConfig => ({
  cols: FOOTPRINT_COLS,
  lookup,
  rows: FOOTPRINT_ROWS,
  seed,
  showRooms: layers.showRooms,
  showTiles: layers.showTiles,
});

export const GenerateView = ({ store }: { store: MetadataStore }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GenerateScene | null>(null);
  const [seed, setSeed] = useState(newSeed);
  const [showTiles, setShowTiles] = useState(true);
  const [showRooms, setShowRooms] = useState(false);
  const [selected, setSelected] = useState(ZERO);
  const lookup = useMemo(() => buildAutotileLookup(wallGroup(store.metadata)), [store.metadata]);

  useEffect(() => {
    const scene = new GenerateScene(config(seed, { showRooms, showTiles }, lookup), setSelected);
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
    sceneRef.current?.configure(config(seed, { showRooms, showTiles }, lookup));
  }, [seed, showTiles, showRooms, lookup]);

  return (
    <div style={styles.page}>
      <GenerateToolbar
        seed={seed}
        onSeed={setSeed}
        onRegenerate={() => setSeed(newSeed())}
        showTiles={showTiles}
        onTiles={setShowTiles}
        showRooms={showRooms}
        onRooms={setShowRooms}
      />
      <div style={styles.body}>
        <div ref={containerRef} style={styles.canvas} />
        <TileInspector store={store} selected={selected} onSelect={setSelected} />
      </div>
    </div>
  );
};
