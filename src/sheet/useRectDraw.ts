import { useEffect, useRef, useState, type MouseEvent, type RefObject } from "react";

import type { Rect } from "./useSheetEditor.ts";

const MIN_RECT = 1;
const PRIMARY_BUTTON = 0;
const ORIGIN = 0;

type Drag = { x0: number; y0: number; x1: number; y1: number };

const clamp = (value: number, max: number): number => Math.max(ORIGIN, Math.min(value, max));

export const toRect = (drag: Drag): Rect => ({
  height: Math.round(Math.abs(drag.y1 - drag.y0)),
  left: Math.round(Math.min(drag.x0, drag.x1)),
  top: Math.round(Math.min(drag.y0, drag.y1)),
  width: Math.round(Math.abs(drag.x1 - drag.x0)),
});

type RectDrawParams = {
  overlay: RefObject<HTMLDivElement | null>;
  scale: number;
  width: number;
  height: number;
  onDraw: (rect: Rect) => void;
};

export const useRectDraw = ({ overlay, scale, width, height, onDraw }: RectDrawParams) => {
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const onDrawRef = useRef(onDraw);
  dragRef.current = drag;
  onDrawRef.current = onDraw;
  const active = drag !== null;

  const pointIn = (clientX: number, clientY: number): { px: number; py: number } => {
    const bounds = overlay.current?.getBoundingClientRect();
    const left = bounds?.left ?? ORIGIN;
    const top = bounds?.top ?? ORIGIN;
    return {
      px: clamp((clientX - left) / scale, width),
      py: clamp((clientY - top) / scale, height),
    };
  };

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    const onMove = (event: globalThis.MouseEvent) => {
      const point = pointIn(event.clientX, event.clientY);
      setDrag((current) => {
        if (!current) {
          return current;
        }
        return { ...current, x1: point.px, y1: point.py };
      });
    };
    const onUp = () => {
      const { current } = dragRef;
      if (current) {
        const rect = toRect(current);
        if (rect.width >= MIN_RECT && rect.height >= MIN_RECT) {
          onDrawRef.current(rect);
        }
      }
      setDrag(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [active, scale, width, height, overlay]);

  const beginDraw = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== PRIMARY_BUTTON) {
      return;
    }
    const point = pointIn(event.clientX, event.clientY);
    setDrag({ x0: point.px, x1: point.px, y0: point.py, y1: point.py });
  };

  return { beginDraw, drag };
};
