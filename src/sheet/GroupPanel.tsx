import { sheetStyles } from "./sheetStyles.ts";
import { GroupList } from "./GroupList.tsx";
import { GroupTemplateForm } from "./GroupTemplateForm.tsx";
import { SubSpriteGroupForm } from "./SubSpriteGroupForm.tsx";
import type { SheetGroupsState } from "./useSheetGroups.ts";

const EMPTY = 0;

type GroupPanelProps = {
  groupState: SheetGroupsState;
};

export const GroupPanel = ({ groupState }: GroupPanelProps) => {
  const { groups, selectedIndex, template, setTemplate, showGrid, setShowGrid, handlers } =
    groupState;
  const selected = groups[selectedIndex];
  return (
    <>
      <GroupTemplateForm
        template={template}
        onChange={setTemplate}
        showGrid={showGrid}
        onShowGrid={setShowGrid}
      />
      {groups.length > EMPTY && (
        <button type="button" style={sheetStyles.addButton} onClick={handlers.applyTemplateAll}>
          Reset all {groups.length} groups from template
        </button>
      )}
      <GroupList
        groups={groups}
        selectedIndex={selectedIndex}
        onSelect={handlers.select}
        onAdd={handlers.add}
        onRemove={handlers.remove}
        onTile={handlers.tile}
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
