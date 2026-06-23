import { GroupDetail } from "./GroupDetail.tsx";
import type { SheetMode } from "./SheetPanel.tsx";
import type { SheetEditorState } from "./useSheetEditor.ts";
import type { SheetGroupsState } from "./useSheetGroups.ts";

type GroupDetailPanelProps = {
  mode: SheetMode;
  view: SheetEditorState;
  groupState: SheetGroupsState;
};

export const GroupDetailPanel = ({ mode, view, groupState }: GroupDetailPanelProps) => {
  const group = groupState.groups[groupState.selectedIndex];
  if (mode !== "group" || !group || !view.entry) {
    return null;
  }
  return (
    <GroupDetail
      group={group}
      url={view.url}
      sheetWidth={view.entry.width}
      sheetHeight={view.entry.height}
      onName={(name) => groupState.handlers.setName(groupState.selectedIndex, name)}
      onPrev={groupState.handlers.prev}
      onNext={groupState.handlers.next}
      onClose={groupState.handlers.deselect}
    />
  );
};
