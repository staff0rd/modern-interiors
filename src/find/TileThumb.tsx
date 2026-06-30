import { type ReactNode } from "react";

import { sheetStyles } from "../sheet/sheetStyles.ts";

const TILE = 16;

export type SheetSize = { height: number; width: number };

type TileThumbProps = {
  col: number;
  path: string;
  root: string;
  row: number;
  sheet: SheetSize | undefined;
  zoom: number;
};

export const TileThumb = ({ col, path, root, row, sheet, zoom }: TileThumbProps): ReactNode => {
  if (!sheet) {
    return null;
  }
  return (
    <div style={{ ...sheetStyles.detailFrame, height: TILE * zoom, width: TILE * zoom }}>
      <img
        style={{
          ...sheetStyles.detailImage,
          height: sheet.height * zoom,
          left: -col * TILE * zoom,
          top: -row * TILE * zoom,
          width: sheet.width * zoom,
        }}
        src={`/${root}/${path}`}
        alt=""
        draggable={false}
      />
    </div>
  );
};
