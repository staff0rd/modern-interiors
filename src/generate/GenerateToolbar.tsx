import { Link } from "react-router-dom";

import { ItchioLink } from "../browse/ItchioLink.tsx";
import { styles } from "./generateStyles.ts";

const ZERO = 0;

type GenerateToolbarProps = {
  seed: number;
  onSeed: (seed: number) => void;
  onRegenerate: () => void;
  showTiles: boolean;
  onTiles: (value: boolean) => void;
  showRooms: boolean;
  onRooms: (value: boolean) => void;
};

export const GenerateToolbar = ({
  seed,
  onSeed,
  onRegenerate,
  showTiles,
  onTiles,
  showRooms,
  onRooms,
}: GenerateToolbarProps) => (
  <div style={styles.bar}>
    <Link to="/" style={styles.link}>
      ← Browse
    </Link>
    <strong>BSP room generator</strong>
    <label>
      seed{" "}
      <input
        style={styles.field}
        value={seed}
        onChange={(event) => onSeed(Number(event.target.value) || ZERO)}
      />
    </label>
    <button style={styles.button} onClick={onRegenerate}>
      Regenerate
    </button>
    <label>
      <input
        type="checkbox"
        checked={showTiles}
        onChange={(event) => onTiles(event.target.checked)}
      />{" "}
      tiles
    </label>
    <label>
      <input
        type="checkbox"
        checked={showRooms}
        onChange={(event) => onRooms(event.target.checked)}
      />{" "}
      rooms
    </label>
    <span style={{ marginLeft: "auto" }}>
      <ItchioLink />
    </span>
  </div>
);
