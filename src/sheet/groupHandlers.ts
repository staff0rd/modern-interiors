import {
  addDefault,
  append,
  applyTemplateToAll,
  describe,
  NONE,
  removeAllGroups,
  removeAt,
  replaceAt,
  STEP,
  stepSelection,
  stepTileSelection,
  templatePatch,
  tileFrom,
  toggleAt,
  updateAt,
  type GroupContext,
} from "./groupMutations.ts";
import type { Rect } from "./useSheetEditor.ts";

export type GroupHandlers = {
  add: () => void;
  draw: (rect: Rect) => void;
  remove: (index: number) => void;
  removeAll: () => void;
  select: (index: number) => void;
  setName: (index: number, name: string) => void;
  setDescription: (index: number, description: string) => void;
  setRect: (index: number, rect: Rect) => void;
  setVariant: (index: number, cell: number, name: string) => void;
  applyTemplate: (index: number) => void;
  applyTemplateAll: () => void;
  tile: (index: number, count: number) => void;
  toggle: (index: number) => void;
  deselect: () => void;
  prev: () => void;
  next: () => void;
  selectTile: (index: number) => void;
  deselectTile: () => void;
  prevTile: () => void;
  nextTile: () => void;
};

const mutateHandlers = (context: GroupContext) => ({
  add: () => addDefault(context),
  draw: (rect: Rect) => append(context, rect),
  remove: (index: number) => removeAt(context, index),
  tile: (index: number, count: number) => tileFrom(context, index, count),
});

const navHandlers = (context: GroupContext) => ({
  deselect: () => context.setSelectedIndex(NONE),
  next: () => stepSelection(context, STEP),
  prev: () => stepSelection(context, -STEP),
  select: context.setSelectedIndex,
  toggle: (index: number) => toggleAt(context, index),
});

const tileHandlers = (context: GroupContext) => ({
  deselectTile: () => context.setSelectedTileIndex(NONE),
  nextTile: () => stepTileSelection(context, STEP),
  prevTile: () => stepTileSelection(context, -STEP),
  selectTile: (index: number) => context.setSelectedTileIndex(index),
});

const templateHandlers = (context: GroupContext) => ({
  applyTemplate: (index: number) => updateAt(context, index, templatePatch(context.template)),
  applyTemplateAll: () => applyTemplateToAll(context),
  removeAll: () => removeAllGroups(context),
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
  ...tileHandlers(context),
  ...templateHandlers(context),
  ...fieldHandlers(context),
});
