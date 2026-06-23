import type { CSSProperties } from "react";

import type { SaveState } from "../metadata/useMetadata.ts";
import { editorStyles } from "./editorStyles.ts";
import { NumberField } from "./NumberField.tsx";

const MIN_FRAME_RATE = 1;
const MIN_TILES = 1;
const NAME_WIDTH = 200;
const NUMBER_WIDTH = 90;
const TILE_WIDTH = 70;

const saveLabels: Record<SaveState, string> = {
  error: "save failed",
  idle: "",
  saved: "saved",
  saving: "saving…",
};

type AnimationControlsProps = {
  name: string;
  frameRate: number;
  repeat: number;
  yoyo: boolean;
  tileColumns: number;
  tileRows: number;
  saveState: SaveState;
  onName: (value: string) => void;
  onFrameRate: (value: number) => void;
  onRepeat: (value: number) => void;
  onYoyo: (value: boolean) => void;
  onTileColumns: (value: number) => void;
  onTileRows: (value: number) => void;
};

const nameStyle: CSSProperties = { ...editorStyles.input, width: NAME_WIDTH };

export const AnimationControls = ({
  name,
  frameRate,
  repeat,
  yoyo,
  tileColumns,
  tileRows,
  saveState,
  onName,
  onFrameRate,
  onRepeat,
  onYoyo,
  onTileColumns,
  onTileRows,
}: AnimationControlsProps) => (
  <div style={editorStyles.controls}>
    <label style={editorStyles.field}>
      Name
      <input
        style={nameStyle}
        value={name}
        placeholder="e.g. animated_spider"
        onChange={(event) => onName(event.target.value)}
      />
    </label>
    <NumberField
      label="Frame rate (fps)"
      value={frameRate}
      width={NUMBER_WIDTH}
      min={MIN_FRAME_RATE}
      onChange={onFrameRate}
    />
    <NumberField
      label="Repeat (-1 = loop)"
      value={repeat}
      width={NUMBER_WIDTH}
      onChange={onRepeat}
    />
    <label style={editorStyles.checkboxField}>
      <input type="checkbox" checked={yoyo} onChange={(event) => onYoyo(event.target.checked)} />
      Ping-pong
    </label>
    <NumberField
      label="Tiles wide / frame"
      value={tileColumns}
      width={TILE_WIDTH}
      min={MIN_TILES}
      onChange={onTileColumns}
    />
    <NumberField
      label="Tiles tall / frame"
      value={tileRows}
      width={TILE_WIDTH}
      min={MIN_TILES}
      onChange={onTileRows}
    />
    <span style={{ color: "#8a8d9b", paddingBottom: 6 }}>{saveLabels[saveState]}</span>
  </div>
);
