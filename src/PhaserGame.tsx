import Phaser from "phaser";
import { useEffect, useRef } from "react";

import { BaseScene } from "./scenes/BaseScene.ts";

const PhaserGame = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const game = new Phaser.Game({
      parent: containerRef.current ?? undefined,
      pixelArt: true,
      scale: {
        height: "100%",
        mode: Phaser.Scale.RESIZE,
        width: "100%",
      },
      scene: [BaseScene],
      type: Phaser.AUTO,
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={containerRef} style={{ height: "100vh", width: "100vw" }} />;
};

export default PhaserGame;
