import type { CSSProperties } from "react";

import type { Animation } from "../metadata/schema.ts";
import { tabBarStyles } from "./editorStyles.ts";

const UNNAMED = "(unnamed)";
const ONLY_ONE = 1;

type AnimationTabsProps = {
  animations: Animation[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

const tabStyle = (active: boolean): CSSProperties => {
  if (active) {
    return { ...tabBarStyles.tab, ...tabBarStyles.tabActive };
  }
  return tabBarStyles.tab;
};

export const AnimationTabs = ({
  animations,
  activeIndex,
  onSelect,
  onAdd,
  onRemove,
}: AnimationTabsProps) => (
  <div style={tabBarStyles.bar}>
    {animations.map((animation, index) => (
      <div key={index} style={tabStyle(index === activeIndex)}>
        <button type="button" style={tabBarStyles.label} onClick={() => onSelect(index)}>
          {animation.name.trim() || UNNAMED}
        </button>
        {animations.length > ONLY_ONE && (
          <button
            type="button"
            style={tabBarStyles.remove}
            title="Delete this animation"
            onClick={() => onRemove(index)}
          >
            ×
          </button>
        )}
      </div>
    ))}
    <button type="button" style={tabBarStyles.add} onClick={onAdd}>
      + Add animation
    </button>
  </div>
);
