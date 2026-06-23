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

const identity = (rect: Rect): Rect => rect;

const GRID_LINE = "#57d9a366";

const gridStyle = (cell: GridCell, scale: number): CSSProperties => ({
  ...sheetStyles.grid,
  backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
  backgroundSize: `${cell.width * scale}px ${cell.height * scale}px`,
});

type GridCell = { width: number; height: number };

type SheetCanvasProps = {
  url: string;
  width: number;
  height: number;
  scale: number;
  mode: SheetMode;
  gridCell: GridCell | undefined;
  snap: ((rect: Rect) => Rect) | undefined;
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
  gridCell,
  snap,
  subSprites,
  selectedIndex,
  groups,
  selectedGroupIndex,
  onSelect,
  onSelectGroup,
  onDraw,
}: SheetCanvasProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const snapFn = snap ?? identity;
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
        {gridCell && <div style={gridStyle(gridCell, scale)} />}
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
        {drag && (
          <div style={{ ...sheetStyles.drawPreview, ...placement(snapFn(toRect(drag)), scale) }} />
        )}
      </div>
    </div>
  );
};
