import { useState } from "react";

import { editorStyles } from "../anim/editorStyles.ts";
import { errorMessage } from "../metadata/errorMessage.ts";
import { detectOccupiedCells, type DetectedCell } from "./detectOccupiedCells.ts";
import { sheetStyles } from "./sheetStyles.ts";
import type { Rect } from "./useSheetEditor.ts";

const DEFAULT_THRESHOLD = 16;
const ZERO = 0;

const coveredNote = (skipped: number): string => {
  if (skipped > ZERO) {
    return `, skipped ${skipped} already covered`;
  }
  return "";
};

const buttonLabel = (busy: boolean): string => {
  if (busy) {
    return "Detecting…";
  }
  return "⚡ Auto-detect sub-sprites";
};

type AutoDetectControlsProps = {
  url: string;
  frameWidth: number | null;
  frameHeight: number | null;
  groupRects: Rect[];
  onDetect: (cells: DetectedCell[], groupRects: Rect[], replace: boolean) => number;
};

export const AutoDetectControls = ({
  url,
  frameWidth,
  frameHeight,
  groupRects,
  onDetect,
}: AutoDetectControlsProps) => {
  const [busy, setBusy] = useState(false);
  const [replace, setReplace] = useState(false);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [message, setMessage] = useState("");

  if (!frameWidth || !frameHeight) {
    return (
      <p style={sheetStyles.hint}>Set a frame size on this asset to auto-detect sub-sprites.</p>
    );
  }

  const run = async () => {
    setBusy(true);
    setMessage("");
    try {
      const cells = await detectOccupiedCells(url, {
        frameHeight,
        frameWidth,
        rgbThreshold: threshold,
      });
      const added = onDetect(cells, groupRects, replace);
      const skipped = cells.length - added;
      setMessage(`Found ${cells.length} occupied cells; added ${added}${coveredNote(skipped)}.`);
    } catch (cause) {
      setMessage(errorMessage(cause, "Detection failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <label style={editorStyles.checkboxField}>
        Background threshold
        <input
          style={{ ...editorStyles.input, width: 64 }}
          type="number"
          min={ZERO}
          value={threshold}
          onChange={(event) => setThreshold(Number(event.target.value))}
        />
      </label>
      <label style={editorStyles.checkboxField}>
        <input
          type="checkbox"
          checked={replace}
          onChange={(event) => setReplace(event.target.checked)}
        />
        Replace existing sub-sprites
      </label>
      <button type="button" style={sheetStyles.addButton} disabled={busy} onClick={run}>
        {buttonLabel(busy)}
      </button>
      {message && <p style={sheetStyles.hint}>{message}</p>}
    </>
  );
};
