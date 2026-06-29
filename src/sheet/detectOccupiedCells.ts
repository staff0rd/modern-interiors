import type { SubSprite } from "../metadata/schema.ts";
import { occupancyKey } from "./groupCells.ts";

type Rect = SubSprite["rect"];

const ZERO = 0;
const ONE = 1;
const GREEN = 1;
const BLUE = 2;
const ALPHA = 3;
const CHANNELS = 4;
const TRANSPARENT = 0;
const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;
const RADIX = 36;

export type DetectedCell = { col: number; rect: Rect; row: number };

type DetectOptions = {
  frameHeight: number;
  frameWidth: number;
  rgbThreshold: number;
};

type Pixels = { data: Uint8ClampedArray; width: number };

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error(`Could not load ${url}`)));
    image.src = url;
  });

const readPixels = (image: HTMLImageElement): Pixels => {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context unavailable");
  }
  context.drawImage(image, ZERO, ZERO);
  const { data } = context.getImageData(ZERO, ZERO, canvas.width, canvas.height);
  return { data, width: canvas.width };
};

const pixelVisible = (data: Uint8ClampedArray, offset: number, rgbThreshold: number): boolean => {
  if ((data[offset + ALPHA] ?? TRANSPARENT) <= TRANSPARENT) {
    return false;
  }
  const red = data[offset] ?? TRANSPARENT;
  const green = data[offset + GREEN] ?? TRANSPARENT;
  const blue = data[offset + BLUE] ?? TRANSPARENT;
  return red > rgbThreshold || green > rgbThreshold || blue > rgbThreshold;
};

const cellOccupied = (pixels: Pixels, rect: Rect, rgbThreshold: number): boolean => {
  for (let py = rect.top; py < rect.top + rect.height; py += ONE) {
    for (let px = rect.left; px < rect.left + rect.width; px += ONE) {
      if (pixelVisible(pixels.data, (py * pixels.width + px) * CHANNELS, rgbThreshold)) {
        return true;
      }
    }
  }
  return false;
};

const cellRect = (col: number, row: number, frame: { height: number; width: number }): Rect => ({
  height: frame.height,
  left: col * frame.width,
  top: row * frame.height,
  width: frame.width,
});

export const detectOccupiedCells = async (
  url: string,
  { frameWidth, frameHeight, rgbThreshold }: DetectOptions,
): Promise<DetectedCell[]> => {
  const pixels = readPixels(await loadImage(url));
  const cols = Math.floor(pixels.width / frameWidth);
  const rows = Math.floor(pixels.data.length / CHANNELS / pixels.width / frameHeight);
  const cells: DetectedCell[] = [];
  for (let row = ZERO; row < rows; row += ONE) {
    for (let col = ZERO; col < cols; col += ONE) {
      const rect = cellRect(col, row, { height: frameHeight, width: frameWidth });
      if (cellOccupied(pixels, rect, rgbThreshold)) {
        cells.push({ col, rect, row });
      }
    }
  }
  return cells;
};

const hashCell = (pixels: Pixels, rect: Rect): string => {
  let hash = FNV_OFFSET;
  for (let py = rect.top; py < rect.top + rect.height; py += ONE) {
    let offset = (py * pixels.width + rect.left) * CHANNELS;
    const end = offset + rect.width * CHANNELS;
    for (; offset < end; offset += ONE) {
      hash = Math.imul(hash ^ (pixels.data[offset] ?? ZERO), FNV_PRIME);
    }
  }
  return (hash >>> ZERO).toString(RADIX);
};

export const detectCellSignatures = async (
  url: string,
  { frameWidth, frameHeight, rgbThreshold }: DetectOptions,
): Promise<Map<string, string>> => {
  const pixels = readPixels(await loadImage(url));
  const cols = Math.floor(pixels.width / frameWidth);
  const rows = Math.floor(pixels.data.length / CHANNELS / pixels.width / frameHeight);
  const signatures = new Map<string, string>();
  for (let row = ZERO; row < rows; row += ONE) {
    for (let col = ZERO; col < cols; col += ONE) {
      const rect = cellRect(col, row, { height: frameHeight, width: frameWidth });
      if (cellOccupied(pixels, rect, rgbThreshold)) {
        signatures.set(occupancyKey(col, row), hashCell(pixels, rect));
      }
    }
  }
  return signatures;
};

const rectsOverlap = (first: Rect, second: Rect): boolean =>
  first.left < second.left + second.width &&
  second.left < first.left + first.width &&
  first.top < second.top + second.height &&
  second.top < first.top + first.height;

export const detectedSubSprites = (cells: DetectedCell[], blocked: Rect[]): SubSprite[] =>
  cells
    .filter((cell) => !blocked.some((rect) => rectsOverlap(cell.rect, rect)))
    .map((cell) => ({ name: `tile_r${cell.row}_c${cell.col}`, rect: cell.rect }));
