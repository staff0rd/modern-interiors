import { useMemo } from "react";

import type { EditorNav } from "../anim/EditorHeader.tsx";
import { useAdjacent } from "../browse/useAdjacent.ts";
import type { Manifest, Metadata } from "../metadata/schema.ts";
import {
  buildVariantIndex,
  resolveMetadata,
  variantMembers,
  type ResolvedMetadata,
  type VariantMember,
} from "../metadata/variants.ts";

export const useVariants = (
  manifest: Manifest,
  metadata: Metadata,
  path: string,
): { resolved: ResolvedMetadata; members: VariantMember[] } => {
  const index = useMemo(() => buildVariantIndex(manifest), [manifest]);
  const resolved = useMemo(() => resolveMetadata(path, metadata, index), [path, metadata, index]);
  const members = useMemo(() => variantMembers(path, metadata, index), [path, metadata, index]);
  return { members, resolved };
};

const stepHandler = (
  target: string | null,
  onOpen: (path: string) => void,
): (() => void) | undefined => {
  if (!target) {
    return undefined;
  }
  return () => onOpen(target);
};

type NavArgs = {
  manifest: Manifest;
  metadata: Metadata;
  path: string;
  onOpen: (path: string) => void;
};

export const useEditorNav = ({ manifest, metadata, path, onOpen }: NavArgs): EditorNav => {
  const adjacent = useAdjacent(manifest, metadata, path);
  return { onNext: stepHandler(adjacent.next, onOpen), onPrev: stepHandler(adjacent.prev, onOpen) };
};
