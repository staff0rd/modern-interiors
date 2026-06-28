import type { SubSpriteGroup } from "../metadata/schema.ts";
import { GroupRow } from "./GroupRow.tsx";
import type { SheetSize } from "./groupTiling.ts";
import { sheetStyles } from "./sheetStyles.ts";

const EMPTY = 0;
const LAST_OFFSET = 1;

type GroupListProps = {
  groups: SubSpriteGroup[];
  sheet: SheetSize;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onRemoveAll: () => void;
  onTile: (index: number, count: number) => void;
};

export const GroupList = ({
  groups,
  sheet,
  selectedIndex,
  onSelect,
  onAdd,
  onRemove,
  onRemoveAll,
  onTile,
}: GroupListProps) => (
  <>
    <div style={sheetStyles.listActions}>
      <button type="button" style={sheetStyles.addButton} onClick={onAdd}>
        ＋ Add group
      </button>
      {groups.length > EMPTY && (
        <button
          type="button"
          style={sheetStyles.clearButton}
          onClick={() => {
            if (window.confirm(`Remove all ${groups.length} groups?`)) {
              onRemoveAll();
            }
          }}
        >
          Remove all
        </button>
      )}
    </div>
    <p style={sheetStyles.hint}>Or drag a rectangle on the sheet; it snaps to the cell grid.</p>
    {groups.map((group, index) => (
      <GroupRow
        key={index}
        group={group}
        sheet={sheet}
        active={index === selectedIndex}
        canTile={index === groups.length - LAST_OFFSET}
        onSelect={() => onSelect(index)}
        onRemove={() => onRemove(index)}
        onTile={(count) => onTile(index, count)}
      />
    ))}
  </>
);
