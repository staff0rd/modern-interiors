# modern-interiors

An in-browser tool for authoring typed metadata across the [Modern Interiors](https://limezu.itch.io/moderninteriors) asset pack.

The metadata is the committed source of truth: scanned into a manifest, edited live in React, and persisted to JSON via a dev-only write endpoint. A generate step derives Phaser-ready atlas + animation configs from it.

## What it authors

- **Animations** — split a sheet into named animations with frame order, frame rate, repeat, and a live preview.
- **Single sprites** — description + orientation.
- **Sprite sheets** — named sub-sprite rects, and repeating cell **groups** (e.g. a grid of recoloured tiles) that can be tiled across a sheet.

## Usage

```bash
npm install
npm run scan-assets   # walk public/moderninteriors-win → metadata/manifest.json
npm run dev           # browse, edit, and preview
```

The asset pack itself is gitignored; `metadata/manifest.json` and `metadata/metadata.json` are the committed artifacts.
