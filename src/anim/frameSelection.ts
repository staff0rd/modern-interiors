const NONE = -1;
const INCLUSIVE_END = 1;

export type Modifiers = { shift: boolean; toggle: boolean };
export type Selection = { selected: Set<number>; anchor: number };

export const emptySelection = (): Selection => ({ anchor: NONE, selected: new Set() });

const range = (from: number, to: number): number[] => {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  return Array.from({ length: hi - lo + INCLUSIVE_END }, (_unused, offset) => lo + offset);
};

const toggled = (current: Selection, position: number): Selection => {
  const selected = new Set(current.selected);
  if (selected.has(position)) {
    selected.delete(position);
  } else {
    selected.add(position);
  }
  return { anchor: position, selected };
};

export const nextSelection = (
  current: Selection,
  position: number,
  modifiers: Modifiers,
): Selection => {
  if (modifiers.shift && current.anchor !== NONE) {
    return { anchor: current.anchor, selected: new Set(range(current.anchor, position)) };
  }
  if (modifiers.toggle) {
    return toggled(current, position);
  }
  return { anchor: position, selected: new Set([position]) };
};

export const movingSet = (selection: Selection, dragFrom: number): Set<number> => {
  if (selection.selected.has(dragFrom)) {
    return selection.selected;
  }
  return new Set([dragFrom]);
};
