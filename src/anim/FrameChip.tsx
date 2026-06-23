import { chipStyle, NO_ORDINAL, ordinalLabel, toggleInfo } from "./chipStyles.ts";
import { editorStyles } from "./editorStyles.ts";
import { frameCropStyle, type FrameGridGeometry } from "./frames.ts";
import type { FrameStrip } from "./useFrameStrip.ts";

type FrameChipProps = {
  frame: number;
  position: number;
  ordinal: number;
  geometry: FrameGridGeometry;
  url: string;
  scale: number;
  selected: boolean;
  dropTarget: boolean;
  strip: FrameStrip;
};

export const FrameChip = ({
  frame,
  position,
  ordinal,
  geometry,
  url,
  scale,
  selected,
  dropTarget,
  strip,
}: FrameChipProps) => {
  const included = ordinal !== NO_ORDINAL;
  const info = toggleInfo(included);
  return (
    <div
      draggable
      style={chipStyle(selected, dropTarget, included)}
      onClick={(event) => strip.onClick(position, event)}
      onDragStart={() => strip.onDragStart(position)}
      onDragEnter={() => strip.onDragEnter(position)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => strip.onDrop(position)}
      title={`frame ${frame}`}
    >
      <div style={frameCropStyle({ geometry, index: frame, scale, url })} />
      <button
        type="button"
        style={editorStyles.toggleButton}
        title={info.title}
        onClick={(event) => {
          event.stopPropagation();
          strip.toggle(frame);
        }}
      >
        {info.glyph}
      </button>
      <span style={editorStyles.index}>{ordinalLabel(ordinal)}</span>
    </div>
  );
};
