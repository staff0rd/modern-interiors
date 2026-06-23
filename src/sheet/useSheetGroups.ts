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
import { useParamSelection } from "./useParamSelection.ts";

const ZERO = 0;
const GROUP_PARAM = "group";

export type SheetGroupsState = {
  groups: SubSpriteGroup[];
  selectedIndex: number;
  template: GroupTemplate;
  setTemplate: (template: GroupTemplate) => void;
  showGrid: boolean;
  setShowGrid: (showGrid: boolean) => void;
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
  const [showGrid, setShowGrid] = useState(false);
  const [selectedIndex, setSelectedIndex] = useParamSelection(GROUP_PARAM, groups.length);

  const handlers = makeGroupHandlers({
    groups,
    persist: (next) => store.setSubSpriteGroups(path, persistable(next)),
    selectedIndex,
    setGroups,
    setSelectedIndex,
    sheet: { height: entry?.height ?? ZERO, width: entry?.width ?? ZERO },
    template,
  });

  return {
    groups,
    handlers,
    selectedIndex,
    setShowGrid,
    setTemplate: (next) => {
      setTemplateState(next);
      store.setGroupTemplate(path, next);
    },
    showGrid,
    template,
  };
};
