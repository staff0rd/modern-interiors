import { editorStyles } from "../anim/editorStyles.ts";
import type { SubSpriteGroup } from "../metadata/schema.ts";
import { gridDims, groupCells } from "./groupCells.ts";
import { RectFields } from "./RectFields.tsx";
import { sheetStyles } from "./sheetStyles.ts";
import type { Rect } from "./useSheetEditor.ts";

type SubSpriteGroupFormProps = {
  group: SubSpriteGroup;
  onName: (name: string) => void;
  onDescription: (description: string) => void;
  onRect: (rect: Rect) => void;
  onVariant: (cell: number, name: string) => void;
  onApplyTemplate: () => void;
};

export const SubSpriteGroupForm = ({
  group,
  onName,
  onDescription,
  onRect,
  onVariant,
  onApplyTemplate,
}: SubSpriteGroupFormProps) => {
  const { cols, rows } = gridDims(group);
  return (
    <>
      <p style={sheetStyles.hint}>
        Group name is the style/recolour (e.g. yellow_floor). Each cell&apos;s variant name below is
        shared across groups; the final sprite name is group/variant. Use “⧉ Tile” on a group above
        to replicate its block across the whole sheet.
      </p>
      <label style={editorStyles.field}>
        Style name
        <input
          style={editorStyles.input}
          value={group.name}
          placeholder="e.g. yellow_floor"
          onChange={(event) => onName(event.target.value)}
        />
      </label>
      <label style={editorStyles.field}>
        Description
        <textarea
          style={sheetStyles.textarea}
          value={group.description ?? ""}
          placeholder="What is this group of tiles?"
          onChange={(event) => onDescription(event.target.value)}
        />
      </label>
      <RectFields rect={group.rect} onChange={onRect} />
      <div style={editorStyles.field}>
        <span>
          Cell variants ({cols}×{rows})
        </span>
        <button type="button" style={sheetStyles.addButton} onClick={onApplyTemplate}>
          Reset names from template
        </button>
        <div style={{ display: "grid", gap: 4, gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {groupCells(group).map((cell) => (
            <input
              key={cell.index}
              style={editorStyles.input}
              value={cell.name}
              placeholder={String(cell.index)}
              onChange={(event) => onVariant(cell.index, event.target.value)}
            />
          ))}
        </div>
      </div>
    </>
  );
};
