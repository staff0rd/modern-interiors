import Phaser from "phaser";
import { useEffect, useRef } from "react";

import { PreviewScene } from "./PreviewScene.ts";

type AnimationPreviewProps = {
  textureKey: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  frameOrder: number[];
  frameRate: number;
  repeat: number;
  yoyo: boolean;
};

const AnimationPreview = ({
  textureKey,
  url,
  frameWidth,
  frameHeight,
  frameOrder,
  frameRate,
  repeat,
  yoyo,
}: AnimationPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PreviewScene | null>(null);

  useEffect(() => {
    const scene = new PreviewScene({ frameHeight, frameWidth, textureKey, url });
    sceneRef.current = scene;
    const game = new Phaser.Game({
      parent: containerRef.current ?? undefined,
      pixelArt: true,
      scale: { height: "100%", mode: Phaser.Scale.RESIZE, width: "100%" },
      scene,
      transparent: true,
      type: Phaser.AUTO,
    });
    return () => {
      sceneRef.current = null;
      game.destroy(true);
    };
  }, [textureKey, url, frameWidth, frameHeight]);

  const frameKey = frameOrder.join(",");
  useEffect(() => {
    sceneRef.current?.apply({ frameOrder, frameRate, repeat, yoyo });
  }, [frameKey, frameRate, repeat, yoyo]);

  return <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />;
};

export default AnimationPreview;
