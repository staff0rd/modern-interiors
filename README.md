# modern-interiors

An in-browser tool for authoring typed metadata across the [Modern Interiors](https://limezu.itch.io/moderninteriors) asset pack.

The metadata is the committed source of truth: scanned into a manifest, edited live in React, and persisted to JSON via a dev-only write endpoint. A generate step derives Phaser-ready atlas + animation configs from it.

## What it authors

- **Animations** — split a sheet into named animations with frame order, frame rate, repeat, and a live preview.
- **Single sprites** — description + orientation.
- **Sprite sheets** — named sub-sprite rects, and repeating cell **groups** (e.g. a grid of recoloured tiles) that can be tiled across a sheet.

## Generate Phaser output

The generate step derives **per-asset, Phaser-native files** from the authored metadata and writes them into the committed `public/generated/` tree, mirroring the pack's folders:

- `<name>.atlas.json` — a TexturePacker JSON-Hash atlas → `this.load.atlas(key, png, atlasURL)`
- `<name>.anims.json` — a Phaser animation config (only when the asset has animations) → `this.load.animation(key, animsURL)`

A game loads whichever files it wants by URL; the atlas is loaded under a texture key equal to the PNG filename without its extension (the `.anims.json` references that key).

Generation runs automatically on every save while editing, and the animation editor's live preview loads those generated files through Phaser's own `load.atlas` / `load.animation` — so the preview is the exact path a game uses, and a correct playback confirms the output is consumable. Run it standalone with `npm run generate`.

## Usage

```bash
npm install
npm run scan-assets   # walk public/moderninteriors-win → metadata/manifest.json
npm run generate      # metadata + manifest → public/generated/*.atlas.json / *.anims.json
npm run dev           # browse, edit, and preview
```

The asset pack itself is gitignored; `metadata/manifest.json`, `metadata/metadata.json`, and the generated `public/generated/` tree are the committed artifacts.
