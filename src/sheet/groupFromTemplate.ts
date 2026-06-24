import type { GroupTemplate, SubSpriteGroup } from "../metadata/schema.ts";
import { adjustNames, cellCount, snapRect } from "./groupCells.ts";
import type { Rect } from "./useSheetEditor.ts";

export const groupFromTemplate = (template: GroupTemplate, rect: Rect): SubSpriteGroup => {
  const snapped = snapRect(rect, template.cellWidth, template.cellHeight);
  const base: SubSpriteGroup = {
    cellHeight: template.cellHeight,
    cellWidth: template.cellWidth,
    name: "",
    rect: snapped,
    variantNames: [],
  };
  return { ...base, variantNames: adjustNames(template.variantNames, cellCount(base)) };
};
