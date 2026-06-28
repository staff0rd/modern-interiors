import { editorStyles } from "../anim/editorStyles.ts";
import { groupCells } from "./groupCells.ts";
import type { SheetMode } from "./SheetPanel.tsx";
import { sheetStyles } from "./sheetStyles.ts";
import { TilePreview } from "./TilePreview.tsx";
import type { SheetEditorState } from "./useSheetEditor.ts";
import type { SheetGroupsState } from "./useSheetGroups.ts";

const NONE = -1;

type TileDetailPanelProps = {
  mode: SheetMode;
  view: SheetEditorState;
  groupState: SheetGroupsState;
};

export const TileDetailPanel = ({ mode, view, groupState }: TileDetailPanelProps) => {
  const group = groupState.groups[groupState.selectedIndex];
  const tileIndex = groupState.selectedTileIndex;
  if (mode !== "group" || !group || tileIndex === NONE || !view.entry) {
    return null;
  }
  const cell = groupCells(group)[tileIndex];
  if (!cell) {
    return null;
  }
  return (
    <div style={sheetStyles.detailArea}>
      <div style={sheetStyles.detailHeader}>
        <input
          style={{ ...editorStyles.input, flex: 1 }}
          value={cell.name}
          placeholder={String(cell.index)}
          onChange={(event) =>
            groupState.handlers.setVariant(groupState.selectedIndex, tileIndex, event.target.value)
          }
        />
        <button
          type="button"
          style={sheetStyles.rowAction}
          title="Previous tile"
          onClick={groupState.handlers.prevTile}
        >
          ‹
        </button>
        <button
          type="button"
          style={sheetStyles.rowAction}
          title="Next tile"
          onClick={groupState.handlers.nextTile}
        >
          ›
        </button>
        <button
          type="button"
          style={sheetStyles.rowAction}
          title="Close tile"
          onClick={groupState.handlers.deselectTile}
        >
          ✕
        </button>
      </div>
      <TilePreview
        cell={cell}
        url={view.url}
        sheetWidth={view.entry.width}
        sheetHeight={view.entry.height}
      />
      <div style={sheetStyles.hint}>Tile {cell.index}</div>
    </div>
  );
};
