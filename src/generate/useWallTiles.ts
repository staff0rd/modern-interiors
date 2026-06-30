import { useMemo } from "react";

import type { SubSpriteGroup } from "../metadata/schema.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";
import { buildPalette, type Palette } from "./palette.ts";
import { wallGroup, wallGroups } from "./tileSheet.ts";
import {
  buildAutotileLookup,
  wallOffsetOf,
  type AutotileLookup,
  type WallOffset,
} from "./tileset.ts";

const ZERO_OFFSET: WallOffset = { col: 0, row: 0 };

const offsetOf = (group: SubSpriteGroup | undefined): WallOffset => {
  if (!group) {
    return ZERO_OFFSET;
  }
  return wallOffsetOf(group);
};

export type WallTiles = {
  group: SubSpriteGroup | undefined;
  groupNames: string[];
  lookup: AutotileLookup;
  wallOffset: WallOffset;
  palette: Palette;
};

export const useWallTiles = (
  store: MetadataStore,
  wallGroupName: string | undefined,
): WallTiles => {
  const group = useMemo(
    () => wallGroup(store.metadata, wallGroupName),
    [store.metadata, wallGroupName],
  );
  const groupNames = useMemo(
    () => wallGroups(store.metadata).map((entry) => entry.name),
    [store.metadata],
  );
  const lookup = useMemo(() => buildAutotileLookup(group), [group]);
  const wallOffset = useMemo(() => offsetOf(group), [group]);
  const palette = useMemo(
    () => buildPalette(store.metadata, store.manifest, wallGroupName),
    [store.metadata, store.manifest, wallGroupName],
  );
  return { group, groupNames, lookup, palette, wallOffset };
};
