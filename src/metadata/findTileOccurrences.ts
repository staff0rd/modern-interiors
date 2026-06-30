import type { TileOccurrence, TilesDb } from "./schema.ts";

export const findTileOccurrences = (db: TilesDb, cell: TileOccurrence): TileOccurrence[] | null => {
  for (const occurrences of Object.values(db.tiles)) {
    const match = occurrences.some(
      (occurrence) =>
        occurrence.path === cell.path && occurrence.row === cell.row && occurrence.col === cell.col,
    );
    if (match) {
      return occurrences;
    }
  }
  return null;
};
