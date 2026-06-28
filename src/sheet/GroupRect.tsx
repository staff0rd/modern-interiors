import type { CSSProperties, MouseEvent } from "react";

import type { SubSpriteGroup } from "../metadata/schema.ts";
import { inactiveStyle, sheetStyles } from "./sheetStyles.ts";

const selectionStyle = (selected: boolean): CSSProperties => {
  if (selected) {
    return sheetStyles.groupSelected;
  }
  return {};
};

const groupStyle = (group: SubSpriteGroup, scale: number, selected: boolean): CSSProperties => ({
  ...sheetStyles.group,
  ...selectionStyle(selected),
  height: group.rect.height * scale,
  left: group.rect.left * scale,
  top: group.rect.top * scale,
  width: group.rect.width * scale,
});

type GroupRectProps = {
  group: SubSpriteGroup;
  scale: number;
  selected: boolean;
  interactive: boolean;
  onSelect: () => void;
};

export const GroupRect = ({ group, scale, selected, interactive, onSelect }: GroupRectProps) => {
  const select = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onSelect();
  };
  return (
    <div
      style={{ ...groupStyle(group, scale, selected), ...inactiveStyle(interactive) }}
      onMouseDown={select}
    >
      <span style={sheetStyles.groupLabel}>{group.name || "(unnamed)"}</span>
    </div>
  );
};
