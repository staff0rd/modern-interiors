import type { SheetMode } from "./SheetPanel.tsx";
import { SubSpriteDetail } from "./SubSpriteDetail.tsx";
import type { SheetEditorState } from "./useSheetEditor.ts";

type SubSpriteDetailPanelProps = {
  mode: SheetMode;
  view: SheetEditorState;
};

export const SubSpriteDetailPanel = ({ mode, view }: SubSpriteDetailPanelProps) => {
  const subSprite = view.subSprites[view.selectedIndex];
  if (mode !== "sub" || !subSprite || !view.entry) {
    return null;
  }
  return (
    <SubSpriteDetail
      subSprite={subSprite}
      url={view.url}
      sheetWidth={view.entry.width}
      sheetHeight={view.entry.height}
      onName={(name) => view.handlers.setName(view.selectedIndex, name)}
      onPrev={view.handlers.prev}
      onNext={view.handlers.next}
      onClose={view.handlers.deselect}
    />
  );
};
