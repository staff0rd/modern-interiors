import Phaser from "phaser";

const ANIM_KEY = "preview-anim";
const ORIGIN = 0;
const FIRST_FRAME = 0;
const HALF = 2;
const MIN_SCALE = 1;
const FIT_MARGIN = 1.5;
const EMPTY = 0;

type PreviewConfig = {
  frameOrder: number[];
  frameRate: number;
  repeat: number;
  yoyo: boolean;
};

type PreviewOptions = {
  textureKey: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
};

export class PreviewScene extends Phaser.Scene {
  private sprite?: Phaser.GameObjects.Sprite;
  private ready = false;
  private pending: PreviewConfig | null = null;
  private readonly opts: PreviewOptions;

  constructor(opts: PreviewOptions) {
    super("preview");
    this.opts = opts;
  }

  preload() {
    this.load.spritesheet(this.opts.textureKey, this.opts.url, {
      frameHeight: this.opts.frameHeight,
      frameWidth: this.opts.frameWidth,
    });
  }

  create() {
    this.sprite = this.add.sprite(ORIGIN, ORIGIN, this.opts.textureKey);
    this.ready = true;
    this.layout(this.scale.gameSize);
    this.scale.on("resize", this.layout, this);
    if (this.pending) {
      this.apply(this.pending);
    }
  }

  apply(config: PreviewConfig) {
    if (!this.ready || !this.sprite) {
      this.pending = config;
      return;
    }
    this.rebuild(config, this.sprite);
  }

  private rebuild(config: PreviewConfig, sprite: Phaser.GameObjects.Sprite) {
    if (this.anims.exists(ANIM_KEY)) {
      this.anims.remove(ANIM_KEY);
    }
    if (config.frameOrder.length === EMPTY) {
      sprite.stop();
      sprite.setFrame(FIRST_FRAME);
      return;
    }
    this.anims.create({
      frameRate: config.frameRate,
      frames: this.anims.generateFrameNumbers(this.opts.textureKey, { frames: config.frameOrder }),
      key: ANIM_KEY,
      repeat: config.repeat,
      yoyo: config.yoyo,
    });
    sprite.play(ANIM_KEY);
  }

  private layout(size: Phaser.Structs.Size) {
    if (!this.sprite) {
      return;
    }
    const fit = Math.min(size.width / this.opts.frameWidth, size.height / this.opts.frameHeight);
    const scale = Math.max(MIN_SCALE, Math.floor(fit / FIT_MARGIN));
    this.sprite.setScale(scale).setPosition(size.width / HALF, size.height / HALF);
  }
}
