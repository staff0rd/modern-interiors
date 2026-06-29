import Phaser from "phaser";
import { useEffect, useRef, type RefObject } from "react";

import { GenerateScene, type PickHandler, type SceneConfig } from "./GenerateScene.ts";

export const useGenerateScene = (
  scene: SceneConfig,
  onPick: PickHandler,
  ready: boolean,
): RefObject<HTMLDivElement | null> => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GenerateScene | null>(null);

  useEffect(() => {
    if (!ready) {
      return undefined;
    }
    const instance = new GenerateScene(scene, onPick);
    sceneRef.current = instance;
    const game = new Phaser.Game({
      backgroundColor: "#16171d",
      parent: containerRef.current ?? undefined,
      pixelArt: true,
      scale: { height: "100%", mode: Phaser.Scale.RESIZE, width: "100%" },
      scene: instance,
      type: Phaser.AUTO,
    });
    return () => {
      sceneRef.current = null;
      game.destroy(true);
    };
  }, [ready]);

  useEffect(() => {
    sceneRef.current?.configure(scene);
  }, [scene]);

  return containerRef;
};
