import type { GroupTemplate, SubSpriteGroup } from "../metadata/schema.ts";
import { adjustNames, cellCount, snapRect } from "./groupCells.ts";
import type { Rect } from "./useSheetEditor.ts";

const NONE = -1;
const ONE_CELL = 1;
const ORIGIN = 0;

export type GroupHandlers = {
  add: () => void;
  draw: (rect: Rect) => void;
  remove: (index: number) => void;
  select: (index: number) => void;
  setName: (index: number, name: string) => void;
  setDescription: (index: number, description: string) => void;
  setRect: (index: number, rect: Rect) => void;
  setVariant: (index: number, cell: number, name: string) => void;
  applyTemplate: (index: number) => void;
};

export type GroupContext = {
  groups: SubSpriteGroup[];
  template: GroupTemplate;
  setGroups: (groups: SubSpriteGroup[]) => void;
  setSelectedIndex: (index: number) => void;
  persist: (groups: SubSpriteGroup[]) => void;
};

const describe = (description: string): string | undefined => {
  if (description.trim().length > ORIGIN) {
    return description;
  }
  return undefined;
};

const groupFromTemplate = (template: GroupTemplate, rect: Rect): SubSpriteGroup => {
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

const commit = (context: GroupContext, next: SubSpriteGroup[]) => {
  context.setGroups(next);
  context.persist(next);
};

const append = (context: GroupContext, rect: Rect) => {
  commit(context, [...context.groups, groupFromTemplate(context.template, rect)]);
  context.setSelectedIndex(context.groups.length);
};

const updateAt = (context: GroupContext, index: number, patch: Partial<SubSpriteGroup>) =>
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

const replaceAt = (names: string[], target: number, value: string): string[] =>
  names.map((existing, at) => {
    if (at === target) {
      return value;
    }
    return existing;
  });

export const makeGroupHandlers = (context: GroupContext): GroupHandlers => ({
  add: () => {
    const count = Math.max(ONE_CELL, context.template.variantNames.length);
    append(context, {
      height: context.template.cellHeight,
      left: ORIGIN,
      top: ORIGIN,
      width: context.template.cellWidth * count,
    });
  },
  applyTemplate: (index) =>
    updateAt(context, index, {
      cellHeight: context.template.cellHeight,
      cellWidth: context.template.cellWidth,
      variantNames: context.template.variantNames,
    }),
  draw: (rect) => append(context, rect),
  remove: (index) => {
    commit(
      context,
      context.groups.filter((_unused, at) => at !== index),
    );
    context.setSelectedIndex(NONE);
  },
  select: context.setSelectedIndex,
  setDescription: (index, description) =>
    updateAt(context, index, { description: describe(description) }),
  setName: (index, name) => updateAt(context, index, { name }),
  setRect: (index, rect) => updateAt(context, index, { rect }),
  setVariant: (index, cell, name) =>
    updateAt(context, index, {
      variantNames: replaceAt(context.groups[index]?.variantNames ?? [], cell, name),
    }),
});
