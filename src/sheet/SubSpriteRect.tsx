import type { CSSProperties, MouseEvent } from "react";

import type { SubSprite } from "../metadata/schema.ts";
import { inactiveStyle, sheetStyles } from "./sheetStyles.ts";

const selectionStyle = (selected: boolean): CSSProperties => {
  if (selected) {
    return sheetStyles.rectSelected;
  }
  return {};
};

const rectStyle = (subSprite: SubSprite, scale: number, selected: boolean): CSSProperties => ({
  ...sheetStyles.rect,
  ...selectionStyle(selected),
  height: subSprite.rect.height * scale,
  left: subSprite.rect.left * scale,
  top: subSprite.rect.top * scale,
  width: subSprite.rect.width * scale,
});

type SubSpriteRectProps = {
  subSprite: SubSprite;
  scale: number;
  selected: boolean;
  interactive: boolean;
  onSelect: () => void;
};

export const SubSpriteRect = ({
  subSprite,
  scale,
  selected,
  interactive,
  onSelect,
}: SubSpriteRectProps) => {
  const select = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onSelect();
  };
  return (
    <div
      style={{ ...rectStyle(subSprite, scale, selected), ...inactiveStyle(interactive) }}
      onMouseDown={select}
    >
      <span style={sheetStyles.rectLabel}>{subSprite.name || "(unnamed)"}</span>
    </div>
  );
};
