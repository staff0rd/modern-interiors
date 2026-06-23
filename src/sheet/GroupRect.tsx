import type { CSSProperties, MouseEvent } from "react";

import type { SubSpriteGroup } from "../metadata/schema.ts";
import { groupCells } from "./groupCells.ts";
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
      {groupCells(group).map((cell) => (
        <div
          key={cell.index}
          style={{
            ...sheetStyles.cell,
            height: cell.rect.height * scale,
            left: cell.col * group.cellWidth * scale,
            top: cell.row * group.cellHeight * scale,
            width: cell.rect.width * scale,
          }}
        >
          <span style={sheetStyles.cellLabel}>{cell.name || cell.index}</span>
        </div>
      ))}
      <span style={sheetStyles.groupLabel}>{group.name || "(unnamed)"}</span>
    </div>
  );
};
