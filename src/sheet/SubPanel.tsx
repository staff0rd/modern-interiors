import { SubSpriteForm } from "./SubSpriteForm.tsx";
import { SubSpriteList } from "./SubSpriteList.tsx";
import type { SheetEditorState } from "./useSheetEditor.ts";

type SubPanelProps = {
  view: SheetEditorState;
};

export const SubPanel = ({ view }: SubPanelProps) => {
  const { subSprites, selectedIndex, handlers } = view;
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
