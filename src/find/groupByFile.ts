import type { TileOccurrence } from "../metadata/schema.ts";

export type FileGroup = { cells: TileOccurrence[]; path: string };

export const groupByPath = (occurrences: TileOccurrence[]): FileGroup[] => {
  const byPath = new Map<string, TileOccurrence[]>();
  for (const occurrence of occurrences) {
    const existing = byPath.get(occurrence.path);
    if (existing) {
      existing.push(occurrence);
    } else {
      byPath.set(occurrence.path, [occurrence]);
    }
  }
  return [...byPath.entries()]
    .map(([path, cells]) => ({ cells, path }))
    .sort((left, right) => left.path.localeCompare(right.path));
};
