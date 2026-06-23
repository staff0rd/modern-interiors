import { useState } from "react";
import { useSearchParams } from "react-router-dom";

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
const FIRST = 0;
const ZERO = 0;
const GROUP_PARAM = "group";
const DESELECTED = "none";

const initialSelection = (count: number): number => {
  if (count > ZERO) {
    return FIRST;
  }
  return NONE;
};

const resolveSelection = (param: string | null, count: number): number => {
  if (param === DESELECTED) {
    return NONE;
  }
  if (param !== null) {
    const parsed = Number(param);
    if (Number.isInteger(parsed) && parsed >= ZERO && parsed < count) {
      return parsed;
    }
  }
  return initialSelection(count);
};

const paramValue = (index: number): string => {
  if (index === NONE) {
    return DESELECTED;
  }
  return String(index);
};

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
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIndex = resolveSelection(searchParams.get(GROUP_PARAM), groups.length);
  const setSelectedIndex = (index: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(GROUP_PARAM, paramValue(index));
        return next;
      },
      { replace: true },
    );
  };

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
