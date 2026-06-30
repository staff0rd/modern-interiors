import assert from "node:assert/strict";
import { test } from "node:test";

import { hashTileCell, TILE_SIZE } from "./hashTileCell.ts";

const BYTES_PER_PIXEL = 4;
const GREEN_OFFSET = 1;
const BLUE_OFFSET = 2;
const ALPHA_OFFSET = 3;
const TILE_PIXELS = TILE_SIZE * TILE_SIZE;
const SHA256_HEX_LENGTH = 64;
const OPAQUE = 255;
const TRANSPARENT = 0;
const RED = 200;
const GREEN = 120;
const BLUE = 40;
const ORIGIN = 0;

type Pixel = readonly [number, number, number, number];

const makeTile = (pixel: (index: number) => Pixel): Buffer => {
  const buffer = Buffer.alloc(TILE_PIXELS * BYTES_PER_PIXEL);
  for (let index = 0; index < TILE_PIXELS; index++) {
    const [red, green, blue, alpha] = pixel(index);
    const offset = index * BYTES_PER_PIXEL;
    buffer[offset] = red;
    buffer[offset + GREEN_OFFSET] = green;
    buffer[offset + BLUE_OFFSET] = blue;
    buffer[offset + ALPHA_OFFSET] = alpha;
  }
  return buffer;
};

const hashSingleTile = (rgba: Buffer): string | null =>
  hashTileCell({ col: ORIGIN, imageWidth: TILE_SIZE, rgba, row: ORIGIN });

test("returns null for a fully black cell", () => {
  const black = makeTile(() => [ORIGIN, ORIGIN, ORIGIN, OPAQUE]);
  assert.equal(hashSingleTile(black), null);
});

test("returns null for a fully transparent cell", () => {
  const transparent = makeTile(() => [RED, GREEN, BLUE, TRANSPARENT]);
  assert.equal(hashSingleTile(transparent), null);
});

test("produces a stable sha256 hash for identical pixels", () => {
  const first = makeTile(() => [RED, GREEN, BLUE, OPAQUE]);
  const second = makeTile(() => [RED, GREEN, BLUE, OPAQUE]);

  const hash = hashSingleTile(first);

  assert.notEqual(hash, null);
  assert.match(hash ?? "", new RegExp(`^[0-9a-f]{${SHA256_HEX_LENGTH}}$`));
  assert.equal(hash, hashSingleTile(second));
});

test("produces different hashes for different pixels", () => {
  const base = makeTile(() => [RED, GREEN, BLUE, OPAQUE]);
  const variant = makeTile(() => [RED, GREEN, BLUE, OPAQUE]);
  variant[BLUE_OFFSET] = OPAQUE;

  assert.notEqual(hashSingleTile(base), hashSingleTile(variant));
});
