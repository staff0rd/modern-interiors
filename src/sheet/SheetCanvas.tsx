import { useRef, type CSSProperties, type MouseEvent } from "react";

import type { SubSprite, SubSpriteGroup } from "../metadata/schema.ts";
import { GroupRect } from "./GroupRect.tsx";
import { sheetStyles } from "./sheetStyles.ts";
import type { Rect } from "./useSheetEditor.ts";
import { toRect, useRectDraw } from "./useRectDraw.ts";

const placement = (rect: Rect, scale: number): CSSProperties => ({
  height: rect.height * scale,
  left: rect.left * scale,
  top: rect.top * scale,
  width: rect.width * scale,
});

const selectionStyle = (selected: boolean): CSSProperties => {
  if (selected) {
    return sheetStyles.rectSelected;
  }
  return {};
};

const rectStyle = (rect: Rect, scale: number, selected: boolean): CSSProperties => ({
  ...sheetStyles.rect,
  ...selectionStyle(selected),
  ...placement(rect, scale),
});

type SheetCanvasProps = {
  url: string;
  width: number;
  height: number;
  scale: number;
  subSprites: SubSprite[];
  selectedIndex: number;
  groups: SubSpriteGroup[];
  selectedGroupIndex: number;
  onSelect: (index: number) => void;
  onSelectGroup: (index: number) => void;
  onDraw: (rect: Rect) => void;
};

export const SheetCanvas = ({
  url,
  width,
  height,
  scale,
  subSprites,
  selectedIndex,
  groups,
  selectedGroupIndex,
  onSelect,
  onSelectGroup,
  onDraw,
}: SheetCanvasProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { beginDraw, drag } = useRectDraw({ height, onDraw, overlay: overlayRef, scale, width });

  const selectRect = (event: MouseEvent<HTMLDivElement>, index: number) => {
    event.stopPropagation();
    onSelect(index);
  };

  return (
    <div style={{ ...sheetStyles.canvasFrame, height: height * scale, width: width * scale }}>
      <img
        style={{ ...sheetStyles.image, height: height * scale, width: width * scale }}
        src={url}
        alt=""
        draggable={false}
      />
      <div ref={overlayRef} style={sheetStyles.overlay} onMouseDown={beginDraw}>
        {groups.map((group, index) => (
          <GroupRect
            key={index}
            group={group}
            scale={scale}
            selected={index === selectedGroupIndex}
            onSelect={() => onSelectGroup(index)}
          />
        ))}
        {subSprites.map((subSprite, index) => (
          <div
            key={index}
            style={rectStyle(subSprite.rect, scale, index === selectedIndex)}
            onMouseDown={(event) => selectRect(event, index)}
          >
            <span style={sheetStyles.rectLabel}>{subSprite.name || "(unnamed)"}</span>
          </div>
        ))}
        {drag && <div style={{ ...sheetStyles.drawPreview, ...placement(toRect(drag), scale) }} />}
      </div>
    </div>
  );
};
