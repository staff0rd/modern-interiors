import Phaser from "phaser";

const ORIGIN = 0;
const FIRST = 0;
const HALF = 2;
const MIN_SCALE = 1;
const FIT_MARGIN = 1.5;
const ANIMS_SUFFIX = "-anims";

export type PreviewSources = {
  textureKey: string;
  pngUrl: string;
  atlasUrl: string;
  animsUrl: string;
  animKey: string;
};

export class GeneratedPreviewScene extends Phaser.Scene {
  private sprite?: Phaser.GameObjects.Sprite;
  private ready = false;
  private pending: string;
  private readonly sources: PreviewSources;

  constructor(sources: PreviewSources) {
    super("generated-preview");
    this.sources = sources;
    this.pending = sources.animKey;
  }

  preload() {
    this.load.atlas(this.sources.textureKey, this.sources.pngUrl, this.sources.atlasUrl);
    this.load.animation(`${this.sources.textureKey}${ANIMS_SUFFIX}`, this.sources.animsUrl);
  }

  create() {
    this.sprite = this.add.sprite(ORIGIN, ORIGIN, this.sources.textureKey);
    this.ready = true;
    this.scale.on("resize", this.layout, this);
    this.play(this.pending);
  }

  play(key: string) {
    if (!this.ready || !this.sprite) {
      this.pending = key;
      return;
    }
    if (key && this.anims.exists(key)) {
      this.sprite.play(key);
    } else {
      this.showFirstFrame(this.sprite);
    }
    this.layout(this.scale.gameSize);
  }

  private showFirstFrame(sprite: Phaser.GameObjects.Sprite) {
    sprite.stop();
    const first = this.textures.get(this.sources.textureKey).getFrameNames()[FIRST];
    if (first) {
      sprite.setFrame(first);
    }
  }

  private layout(size: Phaser.Structs.Size) {
    if (!this.sprite) {
      return;
    }
    const fit = Math.min(
      size.width / this.sprite.frame.width,
      size.height / this.sprite.frame.height,
    );
    const scale = Math.max(MIN_SCALE, Math.floor(fit / FIT_MARGIN));
    this.sprite.setScale(scale).setPosition(size.width / HALF, size.height / HALF);
  }
}
