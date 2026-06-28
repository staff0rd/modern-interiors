import { useState } from "react";

import {
  subSpriteGroupSchema,
  type GroupTemplate,
  type ManifestEntry,
  type SubSpriteGroup,
} from "../metadata/schema.ts";
import { useDebouncedCallback } from "../metadata/useDebouncedCallback.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";
import { cellCount, defaultCellSize } from "./groupCells.ts";
import { makeGroupHandlers, type GroupHandlers } from "./groupHandlers.ts";
import type { SheetSize } from "./groupTiling.ts";
import { useParamSelection } from "./useParamSelection.ts";
import { useTileSelection } from "./useTileSelection.ts";

const ZERO = 0;
const GROUP_PARAM = "group";
const TILE_PARAM = "tile";

export type SheetGroupsState = {
  groups: SubSpriteGroup[];
  selectedIndex: number;
  selectedTileIndex: number;
  sheet: SheetSize;
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

const tileCountOf = (group: SubSpriteGroup | undefined): number => {
  if (!group) {
    return ZERO;
  }
  return cellCount(group);
};

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
  const [selectedTileIndex, setSelectedTileIndex] = useTileSelection(
    TILE_PARAM,
    tileCountOf(groups[selectedIndex]),
    selectedIndex,
  );
  const persist = useDebouncedCallback((next: SubSpriteGroup[]) =>
    store.setSubSpriteGroups(path, persistable(next)),
  );
  const sheet: SheetSize = { height: entry?.height ?? ZERO, width: entry?.width ?? ZERO };

  const handlers = makeGroupHandlers({
    groups,
    persist,
    selectedIndex,
    selectedTileIndex,
    setGroups,
    setSelectedIndex,
    setSelectedTileIndex,
    sheet,
    template,
  });

  return {
    groups,
    handlers,
    selectedIndex,
    selectedTileIndex,
    setShowGrid,
    setTemplate: (next) => {
      setTemplateState(next);
      store.setGroupTemplate(path, next);
    },
    sheet,
    showGrid,
    template,
  };
};
