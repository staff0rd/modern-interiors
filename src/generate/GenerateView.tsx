import { useEffect, useMemo, useState } from "react";

import type { MetadataStore } from "../metadata/useMetadata.ts";
import type { SceneConfig } from "./GenerateScene.ts";
import { styles } from "./generateStyles.ts";
import { GenerateToolbar } from "./GenerateToolbar.tsx";
import { buildPalette } from "./palette.ts";
import { TileInspector } from "./TileInspector.tsx";
import { wallGroup } from "./tileSheet.ts";
import { buildAutotileLookup } from "./tileset.ts";
import { useGenerateScene } from "./useGenerateScene.ts";
import { usePaint } from "./usePaint.ts";

const FOOTPRINT_COLS = 32;
const FOOTPRINT_ROWS = 20;

type Layers = { showTiles: boolean; showRooms: boolean };

const INITIAL_LAYERS: Layers = { showRooms: false, showTiles: true };
const NO_BRUSH = "";

export const GenerateView = ({ store }: { store: MetadataStore }) => {
  const [layers, setLayers] = useState<Layers>(INITIAL_LAYERS);
  const [selected, setSelected] = useState(NO_BRUSH);
  const lookup = useMemo(() => buildAutotileLookup(wallGroup(store.metadata)), [store.metadata]);
  const palette = useMemo(
    () => buildPalette(store.metadata, store.manifest),
    [store.metadata, store.manifest],
  );
  const { seed, paint, ready, onPick, clear, setSeed, regenerate } = usePaint(selected);
  const scene = useMemo<SceneConfig>(
    () => ({
      cols: FOOTPRINT_COLS,
      lookup,
      paint,
      rows: FOOTPRINT_ROWS,
      seed,
      showRooms: layers.showRooms,
      showTiles: layers.showTiles,
    }),
    [seed, layers, lookup, paint],
  );
  const containerRef = useGenerateScene(scene, onPick, ready);

  useEffect(() => {
    const [first] = palette.walls;
    if (selected === NO_BRUSH && first) {
      setSelected(first.token);
    }
  }, [palette, selected]);

  return (
    <div style={styles.page}>
      <GenerateToolbar
        seed={seed}
        onSeed={setSeed}
        onRegenerate={regenerate}
        showTiles={layers.showTiles}
        onTiles={(showTiles) => setLayers((current) => ({ ...current, showTiles }))}
        showRooms={layers.showRooms}
        onRooms={(showRooms) => setLayers((current) => ({ ...current, showRooms }))}
      />
      <div style={styles.body}>
        <div ref={containerRef} style={styles.canvas} />
        <TileInspector
          palette={palette}
          selected={selected}
          onSelect={setSelected}
          onClear={clear}
        />
      </div>
    </div>
  );
};
