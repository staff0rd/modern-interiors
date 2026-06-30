import { type ReactNode } from "react";

import type { TileOccurrence } from "../metadata/schema.ts";
import { styles } from "./findStyles.ts";
import { groupByPath, type FileGroup } from "./groupByFile.ts";
import { TileThumb } from "./TileThumb.tsx";
import type { FindData } from "./useFindData.ts";

const SINGULAR = 1;
const THUMB_ZOOM = 4;

const plural = (count: number): string => {
  if (count === SINGULAR) {
    return "";
  }
  return "s";
};

const formatCells = (cells: TileOccurrence[]): string =>
  cells.map((cell) => `(col ${cell.col}, row ${cell.row})`).join("  ");

const FileRow = ({ data, group }: { data: FindData; group: FileGroup }): ReactNode => {
  const [sample] = group.cells;
  return (
    <div style={styles.file}>
      <TileThumb
        col={sample.col}
        path={group.path}
        root={data.root}
        row={sample.row}
        sheet={data.sheets.get(group.path)}
        zoom={THUMB_ZOOM}
      />
      <div style={styles.fileInfo}>
        <div style={styles.fileRow}>
          <span style={styles.filePath}>{group.path}</span>
          <span style={styles.count}>×{group.cells.length}</span>
        </div>
        <div style={styles.cells}>{formatCells(group.cells)}</div>
      </div>
    </div>
  );
};

type FindResultsProps = {
  data: FindData;
  occurrences: TileOccurrence[] | null;
};

export const FindResults = ({ data, occurrences }: FindResultsProps): ReactNode => {
  if (!occurrences) {
    return (
      <div style={styles.empty}>
        No matches — this cell is empty/unscanned or appears in no tracked file.
      </div>
    );
  }
  const groups = groupByPath(occurrences);
  return (
    <>
      <div style={styles.summary}>
        <span style={styles.count}>{occurrences.length}</span> occurrence
        {plural(occurrences.length)} across <span style={styles.count}>{groups.length}</span> file
        {plural(groups.length)}
      </div>
      {groups.map((group) => (
        <FileRow key={group.path} data={data} group={group} />
      ))}
    </>
  );
};
