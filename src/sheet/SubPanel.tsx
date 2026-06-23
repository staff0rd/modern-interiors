import { AutoDetectControls } from "./AutoDetectControls.tsx";
import { SubSpriteForm } from "./SubSpriteForm.tsx";
import { SubSpriteList } from "./SubSpriteList.tsx";
import type { Rect, SheetEditorState } from "./useSheetEditor.ts";

type SubPanelProps = {
  view: SheetEditorState;
  groupRects: Rect[];
};

export const SubPanel = ({ view, groupRects }: SubPanelProps) => {
  const { subSprites, selectedIndex, handlers, entry, url } = view;
  const selected = subSprites[selectedIndex];
  return (
    <>
      <SubSpriteList
        subSprites={subSprites}
        selectedIndex={selectedIndex}
        onSelect={handlers.select}
        onAdd={handlers.add}
        onRemove={handlers.remove}
      />
      <AutoDetectControls
        url={url}
        frameWidth={entry?.frameWidth ?? null}
        frameHeight={entry?.frameHeight ?? null}
        groupRects={groupRects}
        onDetect={handlers.autoDetect}
      />
      {selected && (
        <SubSpriteForm
          subSprite={selected}
          onName={(name) => handlers.setName(selectedIndex, name)}
          onDescription={(description) => handlers.setDescription(selectedIndex, description)}
          onRect={(rect) => handlers.setRect(selectedIndex, rect)}
        />
      )}
    </>
  );
};
