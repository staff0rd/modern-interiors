import { NumberField } from "../anim/NumberField.tsx";
import { sheetStyles } from "./sheetStyles.ts";
import type { Rect } from "./useSheetEditor.ts";

const RECT_FIELD_WIDTH = 64;
const MIN_POS = 0;
const MIN_SIZE = 1;

type RectFieldsProps = {
  rect: Rect;
  onChange: (rect: Rect) => void;
};

export const RectFields = ({ rect, onChange }: RectFieldsProps) => (
  <div style={sheetStyles.rectRow}>
    <NumberField
      label="Left"
      value={rect.left}
      width={RECT_FIELD_WIDTH}
      min={MIN_POS}
      onChange={(left) => onChange({ ...rect, left })}
    />
    <NumberField
      label="Top"
      value={rect.top}
      width={RECT_FIELD_WIDTH}
      min={MIN_POS}
      onChange={(top) => onChange({ ...rect, top })}
    />
    <NumberField
      label="Width"
      value={rect.width}
      width={RECT_FIELD_WIDTH}
      min={MIN_SIZE}
      onChange={(width) => onChange({ ...rect, width })}
    />
    <NumberField
      label="Height"
      value={rect.height}
      width={RECT_FIELD_WIDTH}
      min={MIN_SIZE}
      onChange={(height) => onChange({ ...rect, height })}
    />
  </div>
);
