import type { GroupTemplate, SubSpriteGroup } from "../metadata/schema.ts";
import {
  adjustNames,
  cellCount,
  occupiedInRect,
  snapRect,
  type CellSignatures,
} from "./groupCells.ts";
import type { Rect } from "./useSheetEditor.ts";

export const groupFromTemplate = (
  template: GroupTemplate,
  rect: Rect,
  occupied: CellSignatures | null,
): SubSpriteGroup => {
  const snapped = snapRect(rect, template.cellWidth, template.cellHeight);
  const base: SubSpriteGroup = {
    cellHeight: template.cellHeight,
    cellWidth: template.cellWidth,
    cells: occupiedInRect(occupied, {
      cellHeight: template.cellHeight,
      cellWidth: template.cellWidth,
      rect: snapped,
    }),
    name: "",
    rect: snapped,
    variantNames: [],
  };
  return { ...base, variantNames: adjustNames(template.variantNames, cellCount(base)) };
};
