import { useState, type MouseEvent } from "react";

import { emptySelection, movingSet, nextSelection, type Selection } from "./frameSelection.ts";

const NONE = -1;

type StripApi = {
  onClick: (position: number, event: MouseEvent) => void;
  onDragStart: (position: number) => void;
  onDragEnter: (position: number) => void;
  onDrop: (target: number) => void;
  toggle: (frame: number) => void;
};

export type FrameStrip = StripApi & { selected: Set<number>; dragOver: number };

type StripState = {
  selection: Selection;
  setSelection: (selection: Selection) => void;
  dragFrom: number;
  setDragFrom: (position: number) => void;
  setDragOver: (position: number) => void;
  onMove: (positions: number[], target: number) => void;
  onToggle: (frame: number) => void;
};

const makeApi = (state: StripState): StripApi => ({
  onClick: (position, event) =>
    state.setSelection(
      nextSelection(state.selection, position, {
        shift: event.shiftKey,
        toggle: event.metaKey || event.ctrlKey,
      }),
    ),
  onDragEnter: (position) => state.setDragOver(position),
  onDragStart: (position) => state.setDragFrom(position),
  onDrop: (target) => {
    if (state.dragFrom !== NONE) {
      state.onMove([...movingSet(state.selection, state.dragFrom)], target);
    }
    state.setSelection(emptySelection());
    state.setDragFrom(NONE);
    state.setDragOver(NONE);
  },
  toggle: (frame) => state.onToggle(frame),
});

export const useFrameStrip = (
  onMove: (positions: number[], target: number) => void,
  onToggle: (frame: number) => void,
): FrameStrip => {
  const [selection, setSelection] = useState<Selection>(emptySelection);
  const [dragFrom, setDragFrom] = useState(NONE);
  const [dragOver, setDragOver] = useState(NONE);
  const api = makeApi({
    dragFrom,
    onMove,
    onToggle,
    selection,
    setDragFrom,
    setDragOver,
    setSelection,
  });
  return { ...api, dragOver, selected: selection.selected };
};
