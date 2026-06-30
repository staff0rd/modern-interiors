import { useMemo } from "react";

import type { SubSpriteGroup } from "../metadata/schema.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";
import { buildPalette, type Palette } from "./palette.ts";
import { sheetSize, sheetsWithGroups, wallGroup, wallGroups, wallSheetPath } from "./tileSheet.ts";
import {
  buildAutotileLookup,
  sheetUrl,
  wallColumns,
  wallFrameSpec,
  type AutotileLookup,
  type WallFrameSpec,
} from "./tileset.ts";

export type WallTiles = {
  sheet: string;
  sheetNames: string[];
  url: string;
  group: SubSpriteGroup | undefined;
  groupNames: string[];
  lookup: AutotileLookup;
  wallSpec: WallFrameSpec;
  palette: Palette;
};

export const useWallTiles = (
  store: MetadataStore,
  wallSheet: string | undefined,
  wallGroupName: string | undefined,
): WallTiles => {
  const sheet = useMemo(
    () => wallSheetPath(store.metadata, wallSheet),
    [store.metadata, wallSheet],
  );
  const sheetNames = useMemo(() => sheetsWithGroups(store.metadata), [store.metadata]);
  const url = useMemo(() => sheetUrl(sheet), [sheet]);
  const group = useMemo(
    () => wallGroup(store.metadata, sheet, wallGroupName),
    [store.metadata, sheet, wallGroupName],
  );
  const groupNames = useMemo(
    () => wallGroups(store.metadata, sheet).map((entry) => entry.name),
    [store.metadata, sheet],
  );
  const cols = useMemo(
    () => wallColumns(sheetSize(store.manifest, sheet).width),
    [store.manifest, sheet],
  );
  const lookup = useMemo(() => buildAutotileLookup(group), [group]);
  const wallSpec = useMemo(() => wallFrameSpec(group, cols), [group, cols]);
  const palette = useMemo(
    () => buildPalette(store.metadata, store.manifest, { group: wallGroupName, sheet }),
    [store.metadata, store.manifest, sheet, wallGroupName],
  );
  return { group, groupNames, lookup, palette, sheet, sheetNames, url, wallSpec };
};
