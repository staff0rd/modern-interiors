import { useRef, type CSSProperties } from "react";

import type { SubSprite, SubSpriteGroup } from "../metadata/schema.ts";
import { GroupRect } from "./GroupRect.tsx";
import type { SheetMode } from "./SheetPanel.tsx";
import { sheetStyles } from "./sheetStyles.ts";
import { SubSpriteRect } from "./SubSpriteRect.tsx";
import type { Rect } from "./useSheetEditor.ts";
import { toRect, useRectDraw } from "./useRectDraw.ts";

const placement = (rect: Rect, scale: number): CSSProperties => ({
  height: rect.height * scale,
  left: rect.left * scale,
  top: rect.top * scale,
  width: rect.width * scale,
});

type SheetCanvasProps = {
  url: string;
  width: number;
  height: number;
  scale: number;
  mode: SheetMode;
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
  mode,
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
  const groupsActive = mode === "group";

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
            interactive={groupsActive}
            onSelect={() => onSelectGroup(index)}
          />
        ))}
        {subSprites.map((subSprite, index) => (
          <SubSpriteRect
            key={index}
            subSprite={subSprite}
            scale={scale}
            selected={index === selectedIndex}
            interactive={!groupsActive}
            onSelect={() => onSelect(index)}
          />
        ))}
        {drag && <div style={{ ...sheetStyles.drawPreview, ...placement(toRect(drag), scale) }} />}
      </div>
    </div>
  );
};
