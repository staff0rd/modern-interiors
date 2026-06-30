import { useEffect, useMemo, useState } from "react";

import type { MetadataStore } from "../metadata/useMetadata.ts";
import type { SceneConfig } from "./GenerateScene.ts";
import { styles } from "./generateStyles.ts";
import { GenerateToolbar } from "./GenerateToolbar.tsx";
import { TileInspector } from "./TileInspector.tsx";
import { useGenerateScene } from "./useGenerateScene.ts";
import { usePaint } from "./usePaint.ts";
import { useWallTiles } from "./useWallTiles.ts";

const FOOTPRINT_COLS = 32;
const FOOTPRINT_ROWS = 20;

type Layers = { showTiles: boolean; showRooms: boolean };

const INITIAL_LAYERS: Layers = { showRooms: false, showTiles: true };
const NO_BRUSH = "";

export const GenerateView = ({ store }: { store: MetadataStore }) => {
  const [layers, setLayers] = useState<Layers>(INITIAL_LAYERS);
  const [selected, setSelected] = useState(NO_BRUSH);
  const {
    seed,
    paint,
    ready,
    wallGroup,
    wallSheet,
    onPick,
    clear,
    setSeed,
    setWallGroup,
    setWallSheet,
    regenerate,
  } = usePaint(selected);
  const { sheet, sheetNames, url, group, groupNames, lookup, wallSpec, palette } = useWallTiles(
    store,
    wallSheet,
    wallGroup,
  );
  const scene = useMemo<SceneConfig>(
    () => ({
      cols: FOOTPRINT_COLS,
      lookup,
      paint,
      rows: FOOTPRINT_ROWS,
      seed,
      showRooms: layers.showRooms,
      showTiles: layers.showTiles,
      wallSpec,
      wallUrl: url,
    }),
    [seed, layers, lookup, paint, wallSpec, url],
  );
  const containerRef = useGenerateScene(scene, onPick, ready);

  useEffect(() => {
    const [first] = palette.walls;
    if (selected === NO_BRUSH && first) {
      setSelected(first.token);
    }
  }, [palette, selected]);

  const chooseGroup = (name: string) => {
    setSelected(NO_BRUSH);
    setWallGroup(name);
  };

  const chooseSheet = (name: string) => {
    setSelected(NO_BRUSH);
    setWallGroup(undefined);
    setWallSheet(name);
  };

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
          wallSheets={sheetNames}
          wallSheet={sheet}
          onWallSheet={chooseSheet}
          wallGroups={groupNames}
          wallGroup={group?.name}
          onWallGroup={chooseGroup}
        />
      </div>
    </div>
  );
};
