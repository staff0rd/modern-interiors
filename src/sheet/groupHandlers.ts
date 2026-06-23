import type { GroupTemplate, SubSpriteGroup } from "../metadata/schema.ts";
import { adjustNames, cellCount, snapRect } from "./groupCells.ts";
import { tileGroups, type SheetSize } from "./groupTiling.ts";
import type { Rect } from "./useSheetEditor.ts";

const NONE = -1;
const ONE_CELL = 1;
const ORIGIN = 0;
const STEP = 1;

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
  applyTemplateAll: () => void;
  tile: (index: number) => void;
  toggle: (index: number) => void;
  deselect: () => void;
  prev: () => void;
  next: () => void;
};

export type GroupContext = {
  groups: SubSpriteGroup[];
  template: GroupTemplate;
  sheet: SheetSize;
  selectedIndex: number;
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

const addDefault = (context: GroupContext) => {
  const count = Math.max(ONE_CELL, context.template.variantNames.length);
  append(context, {
    height: context.template.cellHeight,
    left: ORIGIN,
    top: ORIGIN,
    width: context.template.cellWidth * count,
  });
};

const removeAt = (context: GroupContext, index: number) => {
  commit(
    context,
    context.groups.filter((_unused, at) => at !== index),
  );
  context.setSelectedIndex(NONE);
};

const templatePatch = (template: GroupTemplate): Partial<SubSpriteGroup> => ({
  cellHeight: template.cellHeight,
  cellWidth: template.cellWidth,
  variantNames: template.variantNames,
});

const applyTemplateToAll = (context: GroupContext) =>
  commit(
    context,
    context.groups.map((group) => {
      const next = { ...group, ...templatePatch(context.template) };
      return { ...next, variantNames: adjustNames(next.variantNames, cellCount(next)) };
    }),
  );

const stepSelection = (context: GroupContext, delta: number) => {
  const count = context.groups.length;
  if (count === ORIGIN) {
    return;
  }
  context.setSelectedIndex((context.selectedIndex + delta + count) % count);
};

const toggleAt = (context: GroupContext, index: number) => {
  if (index === context.selectedIndex) {
    context.setSelectedIndex(NONE);
    return;
  }
  context.setSelectedIndex(index);
};

const tileFrom = (context: GroupContext, index: number) => {
  const source = context.groups[index];
  if (!source) {
    return;
  }
  commit(context, tileGroups(source, context.sheet));
  context.setSelectedIndex(NONE);
};

const replaceAt = (names: string[], target: number, value: string): string[] =>
  names.map((existing, at) => {
    if (at === target) {
      return value;
    }
    return existing;
  });

const mutateHandlers = (context: GroupContext) => ({
  add: () => addDefault(context),
  draw: (rect: Rect) => append(context, rect),
  remove: (index: number) => removeAt(context, index),
  tile: (index: number) => tileFrom(context, index),
});

const navHandlers = (context: GroupContext) => ({
  deselect: () => context.setSelectedIndex(NONE),
  next: () => stepSelection(context, STEP),
  prev: () => stepSelection(context, -STEP),
  select: context.setSelectedIndex,
  toggle: (index: number) => toggleAt(context, index),
});

const templateHandlers = (context: GroupContext) => ({
  applyTemplate: (index: number) => updateAt(context, index, templatePatch(context.template)),
  applyTemplateAll: () => applyTemplateToAll(context),
});

const fieldHandlers = (context: GroupContext) => ({
  setDescription: (index: number, description: string) =>
    updateAt(context, index, { description: describe(description) }),
  setName: (index: number, name: string) => updateAt(context, index, { name }),
  setRect: (index: number, rect: Rect) => updateAt(context, index, { rect }),
  setVariant: (index: number, cell: number, name: string) =>
    updateAt(context, index, {
      variantNames: replaceAt(context.groups[index]?.variantNames ?? [], cell, name),
    }),
});

export const makeGroupHandlers = (context: GroupContext): GroupHandlers => ({
  ...mutateHandlers(context),
  ...navHandlers(context),
  ...templateHandlers(context),
  ...fieldHandlers(context),
});
