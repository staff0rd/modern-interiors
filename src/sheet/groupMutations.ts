import type { GroupTemplate, SubSpriteGroup } from "../metadata/schema.ts";
import { adjustNames, cellCount } from "./groupCells.ts";
import { groupFromTemplate } from "./groupFromTemplate.ts";
import { tileGroups, type SheetSize } from "./groupTiling.ts";
import type { Rect } from "./useSheetEditor.ts";

export const NONE = -1;
export const STEP = 1;
const ONE_CELL = 1;
const ORIGIN = 0;

export type GroupContext = {
  groups: SubSpriteGroup[];
  template: GroupTemplate;
  sheet: SheetSize;
  selectedIndex: number;
  selectedTileIndex: number;
  setGroups: (groups: SubSpriteGroup[]) => void;
  setSelectedIndex: (index: number) => void;
  setSelectedTileIndex: (index: number) => void;
  persist: (groups: SubSpriteGroup[]) => void;
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
  commit(context, [...context.groups, groupFromTemplate(context.template, rect)]);
  context.setSelectedIndex(context.groups.length);
};

export const updateAt = (context: GroupContext, index: number, patch: Partial<SubSpriteGroup>) =>
  commit(
    context,
    context.groups.map((group, at) => {
      if (at !== index) {
        return group;
      }
      const next = { ...group, ...patch };
      return { ...next, variantNames: adjustNames(next.variantNames, cellCount(next)) };
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
    context.groups.map((group) => {
      const next = { ...group, ...templatePatch(context.template) };
      return { ...next, variantNames: adjustNames(next.variantNames, cellCount(next)) };
    }),
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
  commit(context, [...context.groups, ...tileGroups(source, context.sheet, count)]);
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
