import { z } from "zod";

export const METADATA_VERSION = 1;
const MIN_NAME_LENGTH = 1;

export const KIND_VALUES = ["animation", "single", "spritesheet"] as const;
const kindSchema = z.enum(KIND_VALUES);
export type Kind = z.infer<typeof kindSchema>;

export const ORIENTATION_VALUES = ["up", "down", "left", "right", "none"] as const;
const orientationSchema = z.enum(ORIENTATION_VALUES);
export type Orientation = z.infer<typeof orientationSchema>;

const manifestEntrySchema = z.object({
  frameHeight: z.number().int().positive().nullable(),
  frameWidth: z.number().int().positive().nullable(),
  height: z.number().int().positive(),
  kind: kindSchema,
  path: z.string(),
  width: z.number().int().positive(),
});
export type ManifestEntry = z.infer<typeof manifestEntrySchema>;

export const manifestSchema = z.object({
  entries: z.array(manifestEntrySchema),
  generatedAt: z.string(),
  root: z.string(),
  version: z.literal(METADATA_VERSION),
});
export type Manifest = z.infer<typeof manifestSchema>;

const tileOccurrenceSchema = z.object({
  col: z.number().int().nonnegative(),
  path: z.string(),
  row: z.number().int().nonnegative(),
});
export type TileOccurrence = z.infer<typeof tileOccurrenceSchema>;

export const tilesDbSchema = z.object({
  generatedAt: z.string(),
  root: z.string(),
  tiles: z.record(z.string(), z.array(tileOccurrenceSchema).nonempty()),
  version: z.literal(METADATA_VERSION),
});
export type TilesDb = z.infer<typeof tilesDbSchema>;

const rectSchema = z.object({
  height: z.number().int().positive(),
  left: z.number().int().nonnegative(),
  top: z.number().int().nonnegative(),
  width: z.number().int().positive(),
});
export type Rect = z.infer<typeof rectSchema>;

export const animationSchema = z.object({
  excludedFrames: z.array(z.number().int().nonnegative()).optional(),
  frameOrder: z.array(z.number().int().nonnegative()),
  frameRate: z.number().positive(),
  name: z.string().min(MIN_NAME_LENGTH),
  repeat: z.number().int(),
  tileColumns: z.number().int().positive().optional(),
  tileRows: z.number().int().positive().optional(),
  yoyo: z.boolean().optional(),
});
export type Animation = z.infer<typeof animationSchema>;

export const subSpriteSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(MIN_NAME_LENGTH),
  rect: rectSchema,
});
export type SubSprite = z.infer<typeof subSpriteSchema>;

const AUTOTILE_LAYER_VALUES = ["floor", "wall", "shadow"] as const;
const autotileLayerSchema = z.enum(AUTOTILE_LAYER_VALUES);
export type AutotileLayer = z.infer<typeof autotileLayerSchema>;

const MASK_MAX = 255;
const autotileTagSchema = z.object({
  layer: autotileLayerSchema,
  mask: z.number().int().nonnegative().max(MASK_MAX),
});
export type AutotileTag = z.infer<typeof autotileTagSchema>;

const cellPositionSchema = z.object({
  col: z.number().int().nonnegative(),
  row: z.number().int().nonnegative(),
});

export const subSpriteGroupSchema = z.object({
  autotiles: z.array(autotileTagSchema.nullable()).optional(),
  cellHeight: z.number().int().positive(),
  cellWidth: z.number().int().positive(),
  cells: z.array(cellPositionSchema).optional(),
  description: z.string().optional(),
  name: z.string().min(MIN_NAME_LENGTH),
  rect: rectSchema,
  variantNames: z.array(z.string()),
});
export type SubSpriteGroup = z.infer<typeof subSpriteGroupSchema>;

const groupTemplateSchema = z.object({
  cellHeight: z.number().int().positive(),
  cellWidth: z.number().int().positive(),
  variantNames: z.array(z.string()),
});
export type GroupTemplate = z.infer<typeof groupTemplateSchema>;

const assetMetadataSchema = z.object({
  animations: z.array(animationSchema).optional(),
  description: z.string().optional(),
  detached: z.boolean().optional(),
  groupTemplate: groupTemplateSchema.optional(),
  kind: kindSchema.optional(),
  orientation: orientationSchema.optional(),
  subSpriteGroups: z.array(subSpriteGroupSchema).optional(),
  subSprites: z.array(subSpriteSchema).optional(),
});
export type AssetMetadata = z.infer<typeof assetMetadataSchema>;

export const metadataSchema = z.object({
  assets: z.record(z.string(), assetMetadataSchema),
  version: z.literal(METADATA_VERSION),
});
export type Metadata = z.infer<typeof metadataSchema>;

export const paintReferenceSchema = z.object({
  seed: z.number().int().nonnegative(),
  tiles: z.record(z.string(), z.string()),
  wallGroup: z.string().optional(),
  wallSheet: z.string().optional(),
});
export type PaintReference = z.infer<typeof paintReferenceSchema>;

export const emptyMetadata = (): Metadata => ({ assets: {}, version: METADATA_VERSION });
