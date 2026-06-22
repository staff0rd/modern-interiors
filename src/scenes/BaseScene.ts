import Phaser from "phaser";

const SPIDER_KEY = "spider";
const SPIDER_URL =
  "/moderninteriors-win/3_Animated_objects/32x32/spritesheets/animated_spider_32x32.png";
const FRAME_SIZE = 32;
const HERO_SCALE = 6;
const FRAME_SCALE = 3;
const SPIDER_FPS = 8;
const ORIGIN = 0;
const HALF = 2;
const ORIGIN_CENTER = 0.5;
const GRID_COLUMNS = 8;
const CELL_GAP = 24;
const LABEL_GAP = 8;
const LABEL_FONT_SIZE = 16;
const HERO_Y_RATIO = 0.26;
const GRID_Y_RATIO = 0.62;

export class BaseScene extends Phaser.Scene {
  private hero!: Phaser.GameObjects.Sprite;
  private cells: Phaser.GameObjects.Container[] = [];

  constructor() {
    super("base");
  }

  preload() {
    this.load.spritesheet(SPIDER_KEY, SPIDER_URL, {
      frameHeight: FRAME_SIZE,
      frameWidth: FRAME_SIZE,
    });
  }

  create() {
    this.anims.create({
      frameRate: SPIDER_FPS,
      frames: this.anims.generateFrameNumbers(SPIDER_KEY, {}),
      key: "spider-walk",
      repeat: -1,
    });

    this.hero = this.add.sprite(ORIGIN, ORIGIN, SPIDER_KEY).setScale(HERO_SCALE);
    this.hero.play("spider-walk");

    const frameNames = this.textures.get(SPIDER_KEY).getFrameNames();
    for (const name of frameNames) {
      const sprite = this.add.sprite(ORIGIN, ORIGIN, SPIDER_KEY, name).setScale(FRAME_SCALE);
      const label = this.add
        .text(ORIGIN, (FRAME_SIZE * FRAME_SCALE) / HALF + LABEL_GAP, name, {
          color: "#cccccc",
          fontFamily: "monospace",
          fontSize: `${LABEL_FONT_SIZE}px`,
        })
        .setOrigin(ORIGIN_CENTER, ORIGIN);
      this.cells.push(this.add.container(ORIGIN, ORIGIN, [sprite, label]));
    }

    this.layout(this.scale.gameSize);
    this.scale.on("resize", this.layout, this);
  }

  private layout(gameSize: Phaser.Structs.Size) {
    const { width, height } = gameSize;
    this.hero.setPosition(width / HALF, height * HERO_Y_RATIO);

    const columns = Math.min(this.cells.length, GRID_COLUMNS);
    const rows = Math.ceil(this.cells.length / GRID_COLUMNS);
    const cellSpacing = FRAME_SIZE * FRAME_SCALE + CELL_GAP;
    const rowSpacing = FRAME_SIZE * FRAME_SCALE + LABEL_GAP + LABEL_FONT_SIZE + CELL_GAP;

    const startX = width / HALF - (columns * cellSpacing) / HALF + cellSpacing / HALF;
    const startY = height * GRID_Y_RATIO - (rows * rowSpacing) / HALF + rowSpacing / HALF;

    this.cells.forEach((cell, index) => {
      const column = index % GRID_COLUMNS;
      const row = Math.floor(index / GRID_COLUMNS);
      cell.setPosition(startX + column * cellSpacing, startY + row * rowSpacing);
    });
  }
}
