import { endDropStyle } from "./chipStyles.ts";
import { editorStyles } from "./editorStyles.ts";
import { FrameChip } from "./FrameChip.tsx";
import { playOrdinals, stripScale, type FrameGridGeometry } from "./frames.ts";
import { useFrameStrip } from "./useFrameStrip.ts";

const EMPTY = 0;

type FrameSequenceProps = {
  geometry: FrameGridGeometry;
  url: string;
  frameOrder: number[];
  excluded: Set<number>;
  onMove: (positions: number[], target: number) => void;
  onToggle: (frame: number) => void;
};

export const FrameSequence = ({
  geometry,
  url,
  frameOrder,
  excluded,
  onMove,
  onToggle,
}: FrameSequenceProps) => {
  const strip = useFrameStrip(onMove, onToggle);
  if (frameOrder.length === EMPTY) {
    return <div style={editorStyles.strip}>No frames — reset to all frames to start over.</div>;
  }
  const scale = stripScale();
  const ordinals = playOrdinals(frameOrder, excluded);
  return (
    <div style={editorStyles.strip}>
      {frameOrder.map((frame, position) => (
        <FrameChip
          key={position}
          frame={frame}
          position={position}
          ordinal={ordinals[position]}
          geometry={geometry}
          url={url}
          scale={scale}
          selected={strip.selected.has(position)}
          dropTarget={strip.dragOver === position}
          strip={strip}
        />
      ))}
      <div
        style={endDropStyle(strip.dragOver === frameOrder.length)}
        onDragEnter={() => strip.onDragEnter(frameOrder.length)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => strip.onDrop(frameOrder.length)}
        title="Drop at end"
      />
    </div>
  );
};
