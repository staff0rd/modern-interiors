import Phaser from "phaser";

import { cellTile } from "./cellTile.ts";
import { buildGrid, type Grid } from "./layout.ts";
import { roomOverlay } from "./roomOverlay.ts";
import { cellAt, CELL_MISS, center, fitScale } from "./sceneLayout.ts";
import {
  type AutotileLookup,
  FLOOR_CELL,
  FLOORS_KEY,
  FLOORS_ONLY_KEY,
  FLOORS_ONLY_URL,
  FLOORS_URL,
  type PaintMap,
  TILE,
  type WallOffset,
  WALLS_KEY,
  WALLS_URL,
} from "./tileset.ts";

const ZERO = 0;
const ONE = 1;
const PLACEHOLDER_COLOR = 0x39405a;
const PLACEHOLDER_ALPHA = 0.85;

export type SceneConfig = {
  seed: number;
  cols: number;
  rows: number;
  lookup: AutotileLookup;
  paint: PaintMap;
  wallOffset: WallOffset;
  showTiles: boolean;
  showRooms: boolean;
};

export type PickHandler = (at: number) => void;

type Point = { px: number; py: number };

export class GenerateScene extends Phaser.Scene {
  private ready = false;
  private config: SceneConfig;
  private readonly onPick: PickHandler;
  private root?: Phaser.GameObjects.Container;
  private grid?: Grid;
  private contentWidth = ZERO;
  private contentHeight = ZERO;

  constructor(config: SceneConfig, onPick: PickHandler) {
    super("generate");
    this.config = config;
    this.onPick = onPick;
  }

  preload() {
    this.load.spritesheet(WALLS_KEY, WALLS_URL, { frameHeight: TILE, frameWidth: TILE });
    this.load.spritesheet(FLOORS_KEY, FLOORS_URL, { frameHeight: TILE, frameWidth: TILE });
    this.load.spritesheet(FLOORS_ONLY_KEY, FLOORS_ONLY_URL, {
      frameHeight: TILE,
      frameWidth: TILE,
    });
  }

  create() {
    this.root = this.add.container(ZERO, ZERO);
    this.ready = true;
    this.scale.on("resize", this.layout, this);
    this.input.on("pointerdown", this.pick, this);
    this.draw();
  }

  configure(config: SceneConfig) {
    this.config = config;
    if (this.ready) {
      this.draw();
    }
  }

  private draw() {
    if (!this.root) {
      return;
    }
    this.root.removeAll(true);
    const grid = buildGrid(this.config.seed, { cols: this.config.cols, rows: this.config.rows });
    this.grid = grid;
    this.renderLayers(grid);
    this.contentWidth = grid.cols * TILE;
    this.contentHeight = grid.rows * TILE;
    this.layout(this.scale.gameSize);
  }

  private renderLayers(grid: Grid) {
    if (this.config.showTiles) {
      this.drawBuilding(grid);
    }
    if (this.config.showRooms) {
      this.root?.add(roomOverlay(this, grid));
    }
  }

  private pick(pointer: Phaser.Input.Pointer) {
    if (!this.root || !this.grid) {
      return;
    }
    const at = cellAt(this.root, this.grid, pointer);
    if (at === CELL_MISS) {
      return;
    }
    this.onPick(at);
  }

  private drawBuilding(grid: Grid) {
    for (let row = ZERO; row < grid.rows; row += ONE) {
      for (let col = ZERO; col < grid.cols; col += ONE) {
        this.drawCell(grid, col, row);
      }
    }
  }

  private drawCell(grid: Grid, col: number, row: number) {
    const at = row * grid.cols + col;
    const point: Point = { px: col * TILE, py: row * TILE };
    this.place(FLOORS_KEY, FLOOR_CELL, point);
    const placement = cellTile(this.config, grid, at);
    if (placement) {
      this.place(placement.key, placement.frame, point);
      return;
    }
    if (grid.wall[at]) {
      this.placeholder(point);
    }
  }

  private place(key: string, frame: number, point: Point) {
    this.root?.add(this.add.image(point.px, point.py, key, frame).setOrigin(ZERO));
  }

  private placeholder(point: Point) {
    const rect = this.add
      .rectangle(point.px, point.py, TILE, TILE, PLACEHOLDER_COLOR, PLACEHOLDER_ALPHA)
      .setOrigin(ZERO);
    this.root?.add(rect);
  }

  private layout(size: Phaser.Structs.Size) {
    if (!this.root || this.contentWidth === ZERO || this.contentHeight === ZERO) {
      return;
    }
    const scale = fitScale(size, this.contentWidth, this.contentHeight);
    this.root.setScale(scale);
    this.root.setPosition(
      center(size.width, this.contentWidth * scale),
      center(size.height, this.contentHeight * scale),
    );
  }
}
