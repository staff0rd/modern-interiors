import { type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { ItchioLink } from "../browse/ItchioLink.tsx";
import { editTo } from "../EditorView.tsx";
import { findTileOccurrences } from "../metadata/findTileOccurrences.ts";
import type { TileOccurrence } from "../metadata/schema.ts";
import { FindResults } from "./FindResults.tsx";
import { styles } from "./findStyles.ts";
import { TileThumb } from "./TileThumb.tsx";
import { useFindData, type FindData, type FindState } from "./useFindData.ts";

const RADIX = 10;
const HERO_ZOOM = 8;

const parseCell = (params: URLSearchParams): TileOccurrence | null => {
  const path = params.get("path");
  const row = Number.parseInt(params.get("row") ?? "", RADIX);
  const col = Number.parseInt(params.get("col") ?? "", RADIX);
  if (!path || Number.isNaN(row) || Number.isNaN(col)) {
    return null;
  }
  return { col, path, row };
};

const backTarget = (cell: TileOccurrence | null): string => {
  if (!cell) {
    return "/";
  }
  return editTo(cell.path);
};

const Hero = ({ cell, data }: { cell: TileOccurrence; data: FindData }): ReactNode => (
  <div style={styles.hero}>
    <TileThumb
      col={cell.col}
      path={cell.path}
      root={data.root}
      row={cell.row}
      sheet={data.sheets.get(cell.path)}
      zoom={HERO_ZOOM}
    />
    <div>
      <div style={styles.filePath}>{cell.path}</div>
      <div style={styles.cells}>
        row {cell.row}, col {cell.col}
      </div>
    </div>
  </div>
);

const FindBody = ({
  cell,
  state,
}: {
  cell: TileOccurrence | null;
  state: FindState;
}): ReactNode => {
  if (!cell) {
    return <div style={styles.empty}>Missing or invalid tile — expected ?path=&row=&col=</div>;
  }
  if (state.status === "loading") {
    return <div style={styles.empty}>Loading tiles…</div>;
  }
  if (state.status === "error") {
    return <div style={styles.empty}>Error: {state.error}</div>;
  }
  return (
    <>
      <Hero cell={cell} data={state.data} />
      <FindResults data={state.data} occurrences={findTileOccurrences(state.data.db, cell)} />
    </>
  );
};

export const FindView = () => {
  const [params] = useSearchParams();
  const cell = parseCell(params);
  const state = useFindData();
  return (
    <div style={styles.page}>
      <div style={styles.bar}>
        <Link to={backTarget(cell)} style={styles.link}>
          ← Back
        </Link>
        <strong>Find tile</strong>
        <span style={{ marginLeft: "auto" }}>
          <ItchioLink />
        </span>
      </div>
      <div style={styles.body}>
        <FindBody cell={cell} state={state} />
      </div>
    </div>
  );
};
