import Phaser from "phaser";
import { useEffect, useRef } from "react";

import { GeneratedPreviewScene, type PreviewSources } from "./GeneratedPreviewScene.ts";

const DEBOUNCE_MS = 200;

type GeneratedPreviewProps = {
  textureKey: string;
  pngUrl: string;
  atlasUrl: string;
  animsUrl: string;
  animKey: string;
  reloadToken: number;
};

const GeneratedPreview = ({
  textureKey,
  pngUrl,
  atlasUrl,
  animsUrl,
  animKey,
  reloadToken,
}: GeneratedPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GeneratedPreviewScene | null>(null);
  const animKeyRef = useRef(animKey);
  animKeyRef.current = animKey;

  useEffect(() => {
    let game: Phaser.Game | null = null;
    const sources: PreviewSources = {
      animKey: animKeyRef.current,
      animsUrl,
      atlasUrl,
      pngUrl,
      textureKey,
    };
    const timer = setTimeout(() => {
      const scene = new GeneratedPreviewScene(sources);
      sceneRef.current = scene;
      game = new Phaser.Game({
        parent: containerRef.current ?? undefined,
        pixelArt: true,
        scale: { height: "100%", mode: Phaser.Scale.RESIZE, width: "100%" },
        scene,
        transparent: true,
        type: Phaser.AUTO,
      });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      sceneRef.current = null;
      game?.destroy(true);
    };
  }, [textureKey, pngUrl, atlasUrl, animsUrl, reloadToken]);

  useEffect(() => {
    sceneRef.current?.play(animKey);
  }, [animKey]);

  return <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />;
};

export default GeneratedPreview;
