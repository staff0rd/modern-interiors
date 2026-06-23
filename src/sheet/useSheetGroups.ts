import { useState } from "react";

import {
  subSpriteGroupSchema,
  type GroupTemplate,
  type ManifestEntry,
  type SubSpriteGroup,
} from "../metadata/schema.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";
import { defaultCellSize } from "./groupCells.ts";
import { makeGroupHandlers, type GroupHandlers } from "./groupHandlers.ts";

const NONE = -1;

export type SheetGroupsState = {
  groups: SubSpriteGroup[];
  selectedIndex: number;
  template: GroupTemplate;
  setTemplate: (template: GroupTemplate) => void;
  handlers: GroupHandlers;
};

const defaultTemplate = (entry: ManifestEntry | undefined): GroupTemplate => {
  const cell = defaultCellSize(entry);
  return { cellHeight: cell, cellWidth: cell, variantNames: [] };
};

const persistable = (groups: SubSpriteGroup[]): SubSpriteGroup[] =>
  groups.filter((group) => subSpriteGroupSchema.safeParse(group).success);

export const useSheetGroups = (
  store: MetadataStore,
  path: string,
  entry: ManifestEntry | undefined,
): SheetGroupsState => {
  const asset = store.metadata?.assets[path];
  const [groups, setGroups] = useState<SubSpriteGroup[]>(() => asset?.subSpriteGroups ?? []);
  const [template, setTemplateState] = useState<GroupTemplate>(
    () => asset?.groupTemplate ?? defaultTemplate(entry),
  );
  const [selectedIndex, setSelectedIndex] = useState(NONE);

  const handlers = makeGroupHandlers({
    groups,
    persist: (next) => store.setSubSpriteGroups(path, persistable(next)),
    setGroups,
    setSelectedIndex,
    template,
  });

  return {
    groups,
    handlers,
    selectedIndex,
    setTemplate: (next) => {
      setTemplateState(next);
      store.setGroupTemplate(path, next);
    },
    template,
  };
};
