import type { Cell } from "./groupCells.ts";
import { sheetStyles } from "./sheetStyles.ts";

const MAX_DETAIL = 270;
const MIN_ZOOM = 2;
const ONE = 1;

const tileZoom = (cell: Cell): number => {
  const longest = Math.max(cell.rect.width, cell.rect.height, ONE);
  return Math.max(MIN_ZOOM, Math.floor(MAX_DETAIL / longest));
};

type TilePreviewProps = {
  cell: Cell;
  url: string;
  sheetWidth: number;
  sheetHeight: number;
};

export const TilePreview = ({ cell, url, sheetWidth, sheetHeight }: TilePreviewProps) => {
  const zoom = tileZoom(cell);
  return (
    <div
      style={{
        ...sheetStyles.detailFrame,
        height: cell.rect.height * zoom,
        width: cell.rect.width * zoom,
      }}
    >
      <img
        style={{
          ...sheetStyles.detailImage,
          height: sheetHeight * zoom,
          left: -cell.rect.left * zoom,
          top: -cell.rect.top * zoom,
          width: sheetWidth * zoom,
        }}
        src={url}
        alt=""
        draggable={false}
      />
    </div>
  );
};
