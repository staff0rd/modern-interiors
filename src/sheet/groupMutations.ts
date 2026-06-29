import type { GroupTemplate, SubSpriteGroup } from "../metadata/schema.ts";
import { adjustNames, cellCount, occupiedInRect, type CellSignatures } from "./groupCells.ts";
import { groupFromTemplate } from "./groupFromTemplate.ts";
import { tileGroups, type SheetSize } from "./groupTiling.ts";
import type { Rect } from "./useSheetEditor.ts";

export const NONE = -1;
export const STEP = 1;
const ONE_CELL = 1;
const ORIGIN = 0;
const GEOMETRY_KEYS = ["rect", "cellWidth", "cellHeight"] as const;

export type GroupContext = {
  groups: SubSpriteGroup[];
  template: GroupTemplate;
  sheet: SheetSize;
  occupied: CellSignatures | null;
  selectedIndex: number;
  selectedTileIndex: number;
  setGroups: (groups: SubSpriteGroup[]) => void;
  setSelectedIndex: (index: number) => void;
  setSelectedTileIndex: (index: number) => void;
  persist: (groups: SubSpriteGroup[]) => void;
};

const withNames = (group: SubSpriteGroup): SubSpriteGroup => ({
  ...group,
  variantNames: adjustNames(group.variantNames, cellCount(group)),
});

const trimmed = (context: GroupContext, group: SubSpriteGroup): SubSpriteGroup => {
  const cells = occupiedInRect(context.occupied, group);
  if (!cells) {
    return withNames(group);
  }
  return withNames({ ...group, cells });
};

const nextGroup = (
  context: GroupContext,
  group: SubSpriteGroup,
  patch: Partial<SubSpriteGroup>,
): SubSpriteGroup => {
  const merged = { ...group, ...patch };
  if (GEOMETRY_KEYS.some((key) => key in patch)) {
    return withNames({
      ...merged,
      cells: occupiedInRect(context.occupied, merged) ?? merged.cells,
    });
  }
  return withNames(merged);
};

export const describe = (description: string): string | undefined => {
  if (description.trim().length > ORIGIN) {
    return description;
  }
  return undefined;
};

const commit = (context: GroupContext, next: SubSpriteGroup[]) => {
  context.setGroups(next);
  context.persist(next);
};

export const append = (context: GroupContext, rect: Rect) => {
  const group = groupFromTemplate(context.template, rect, context.occupied);
  commit(context, [...context.groups, { ...group, name: `group-${context.groups.length}` }]);
  context.setSelectedIndex(context.groups.length);
};

export const updateAt = (context: GroupContext, index: number, patch: Partial<SubSpriteGroup>) =>
  commit(
    context,
    context.groups.map((group, at) => {
      if (at !== index) {
        return group;
      }
      return nextGroup(context, group, patch);
    }),
  );

export const addDefault = (context: GroupContext) => {
  const count = Math.max(ONE_CELL, context.template.variantNames.length);
  append(context, {
    height: context.template.cellHeight,
    left: ORIGIN,
    top: ORIGIN,
    width: context.template.cellWidth * count,
  });
};

export const removeAt = (context: GroupContext, index: number) => {
  commit(
    context,
    context.groups.filter((_unused, at) => at !== index),
  );
  context.setSelectedIndex(NONE);
};

export const templatePatch = (template: GroupTemplate): Partial<SubSpriteGroup> => ({
  cellHeight: template.cellHeight,
  cellWidth: template.cellWidth,
  variantNames: template.variantNames,
});

export const applyTemplateToAll = (context: GroupContext) =>
  commit(
    context,
    context.groups.map((group) => nextGroup(context, group, templatePatch(context.template))),
  );

export const stepSelection = (context: GroupContext, delta: number) => {
  const count = context.groups.length;
  if (count === ORIGIN) {
    return;
  }
  context.setSelectedIndex((context.selectedIndex + delta + count) % count);
};

export const stepTileSelection = (context: GroupContext, delta: number) => {
  const group = context.groups[context.selectedIndex];
  if (!group) {
    return;
  }
  const count = cellCount(group);
  if (count === ORIGIN) {
    return;
  }
  context.setSelectedTileIndex((context.selectedTileIndex + delta + count) % count);
};

export const toggleAt = (context: GroupContext, index: number) => {
  if (index === context.selectedIndex) {
    context.setSelectedIndex(NONE);
    return;
  }
  context.setSelectedIndex(index);
};

export const tileFrom = (context: GroupContext, index: number, count: number) => {
  const source = context.groups[index];
  if (!source) {
    return;
  }
  const base = context.groups.length;
  const tiled = tileGroups(source, context.sheet, count).map((group, offset) =>
    trimmed(context, { ...group, name: `group-${base + offset}` }),
  );
  commit(context, [...context.groups, ...tiled]);
  context.setSelectedIndex(NONE);
};

export const replaceAt = (names: string[], target: number, value: string): string[] =>
  names.map((existing, at) => {
    if (at === target) {
      return value;
    }
    return existing;
  });

export const removeAllGroups = (context: GroupContext) => {
  commit(context, []);
  context.setSelectedIndex(NONE);
};
