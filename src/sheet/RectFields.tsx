import { NumberField } from "../anim/NumberField.tsx";
import { sheetStyles } from "./sheetStyles.ts";
import type { Rect } from "./useSheetEditor.ts";

const RECT_FIELD_WIDTH = 64;
const MIN_POS = 0;
const MIN_SIZE = 1;
const DEFAULT_STEP = 1;

type RectFieldsProps = {
  rect: Rect;
  onChange: (rect: Rect) => void;
  stepX?: number;
  stepY?: number;
};

// StepX/stepY make the position+size fields increment by a cell (cellWidth/cellHeight)
// Instead of 1 — for group rects that must stay aligned to the cell grid.
export const RectFields = ({
  rect,
  onChange,
  stepX = DEFAULT_STEP,
  stepY = DEFAULT_STEP,
}: RectFieldsProps) => (
  <div style={sheetStyles.rectRow}>
    <NumberField
      label="Left"
      value={rect.left}
      width={RECT_FIELD_WIDTH}
      min={MIN_POS}
      step={stepX}
      onChange={(left) => onChange({ ...rect, left })}
    />
    <NumberField
      label="Top"
      value={rect.top}
      width={RECT_FIELD_WIDTH}
      min={MIN_POS}
      step={stepY}
      onChange={(top) => onChange({ ...rect, top })}
    />
    <NumberField
      label="Width"
      value={rect.width}
      width={RECT_FIELD_WIDTH}
      min={Math.max(MIN_SIZE, stepX)}
      step={stepX}
      onChange={(width) => onChange({ ...rect, width })}
    />
    <NumberField
      label="Height"
      value={rect.height}
      width={RECT_FIELD_WIDTH}
      min={Math.max(MIN_SIZE, stepY)}
      step={stepY}
      onChange={(height) => onChange({ ...rect, height })}
    />
  </div>
);
