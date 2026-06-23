import { GroupList } from "./GroupList.tsx";
import { GroupTemplateForm } from "./GroupTemplateForm.tsx";
import { SubSpriteGroupForm } from "./SubSpriteGroupForm.tsx";
import type { SheetGroupsState } from "./useSheetGroups.ts";

type GroupPanelProps = {
  groupState: SheetGroupsState;
};

export const GroupPanel = ({ groupState }: GroupPanelProps) => {
  const { groups, selectedIndex, template, setTemplate, handlers } = groupState;
  const selected = groups[selectedIndex];
  return (
    <>
      <GroupTemplateForm template={template} onChange={setTemplate} />
      <GroupList
        groups={groups}
        selectedIndex={selectedIndex}
        onSelect={handlers.select}
        onAdd={handlers.add}
        onRemove={handlers.remove}
      />
      {selected && (
        <SubSpriteGroupForm
          group={selected}
          onName={(name) => handlers.setName(selectedIndex, name)}
          onDescription={(description) => handlers.setDescription(selectedIndex, description)}
          onRect={(rect) => handlers.setRect(selectedIndex, rect)}
          onVariant={(cell, name) => handlers.setVariant(selectedIndex, cell, name)}
          onApplyTemplate={() => handlers.applyTemplate(selectedIndex)}
        />
      )}
    </>
  );
};
