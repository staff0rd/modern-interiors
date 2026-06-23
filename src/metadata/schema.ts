import { z } from "zod";

export const METADATA_VERSION = 1;
const MIN_NAME_LENGTH = 1;

export const KIND_VALUES = ["animation", "single", "spritesheet"] as const;
const kindSchema = z.enum(KIND_VALUES);
export type Kind = z.infer<typeof kindSchema>;

const ORIENTATION_VALUES = ["up", "down", "left", "right", "none"] as const;
const orientationSchema = z.enum(ORIENTATION_VALUES);

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

const rectSchema = z.object({
  height: z.number().int().positive(),
  left: z.number().int().nonnegative(),
  top: z.number().int().nonnegative(),
  width: z.number().int().positive(),
});

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

const subSpriteSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(MIN_NAME_LENGTH),
  rect: rectSchema,
});

const assetMetadataSchema = z.object({
  animations: z.array(animationSchema).optional(),
  description: z.string().optional(),
  kind: kindSchema.optional(),
  orientation: orientationSchema.optional(),
  subSprites: z.array(subSpriteSchema).optional(),
});
export type AssetMetadata = z.infer<typeof assetMetadataSchema>;

export const metadataSchema = z.object({
  assets: z.record(z.string(), assetMetadataSchema),
  version: z.literal(METADATA_VERSION),
});
export type Metadata = z.infer<typeof metadataSchema>;

export const emptyMetadata = (): Metadata => ({ assets: {}, version: METADATA_VERSION });
