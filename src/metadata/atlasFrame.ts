const EMPTY = 0;

export const NAME_SEP = "/";

export type AtlasFrame = {
  name: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type FrameRect = { height: number; left: number; top: number; width: number };

export const hasText = (value: string | undefined): boolean =>
  (value?.trim().length ?? EMPTY) > EMPTY;

export const addFrame = (frames: Map<string, AtlasFrame>, name: string, rect: FrameRect): void => {
  if (!frames.has(name)) {
    frames.set(name, {
      height: rect.height,
      left: rect.left,
      name,
      top: rect.top,
      width: rect.width,
    });
  }
};
