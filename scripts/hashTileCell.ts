import { createHash } from "node:crypto";

export const TILE_SIZE = 16;
const BYTES_PER_PIXEL = 4;
const GREEN_OFFSET = 1;
const BLUE_OFFSET = 2;
const ALPHA_OFFSET = 3;
const CHANNEL_EMPTY = 0;
const TILE_ROW_BYTES = TILE_SIZE * BYTES_PER_PIXEL;
const TILE_BYTES = TILE_SIZE * TILE_ROW_BYTES;

type TileLocation = {
  col: number;
  imageWidth: number;
  rgba: Buffer;
  row: number;
};

const isEmpty = (tile: Buffer): boolean => {
  let allBlack = true;
  let allTransparent = true;
  for (let offset = 0; offset < TILE_BYTES; offset += BYTES_PER_PIXEL) {
    if (
      tile[offset] !== CHANNEL_EMPTY ||
      tile[offset + GREEN_OFFSET] !== CHANNEL_EMPTY ||
      tile[offset + BLUE_OFFSET] !== CHANNEL_EMPTY
    ) {
      allBlack = false;
    }
    if (tile[offset + ALPHA_OFFSET] !== CHANNEL_EMPTY) {
      allTransparent = false;
    }
    if (!allBlack && !allTransparent) {
      return false;
    }
  }
  return allBlack || allTransparent;
};

export const hashTileCell = ({ rgba, imageWidth, row, col }: TileLocation): string | null => {
  const tile = Buffer.allocUnsafe(TILE_BYTES);
  for (let rowInTile = 0; rowInTile < TILE_SIZE; rowInTile++) {
    const srcStart =
      ((row * TILE_SIZE + rowInTile) * imageWidth + col * TILE_SIZE) * BYTES_PER_PIXEL;
    rgba.copy(tile, rowInTile * TILE_ROW_BYTES, srcStart, srcStart + TILE_ROW_BYTES);
  }

  if (isEmpty(tile)) {
    return null;
  }

  return createHash("sha256").update(tile).digest("hex");
};
