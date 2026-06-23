import { editorStyles } from "../anim/editorStyles.ts";
import type { SubSprite } from "../metadata/schema.ts";
import { RectFields } from "./RectFields.tsx";
import { sheetStyles } from "./sheetStyles.ts";
import type { Rect } from "./useSheetEditor.ts";

type SubSpriteFormProps = {
  subSprite: SubSprite;
  onName: (name: string) => void;
  onDescription: (description: string) => void;
  onRect: (rect: Rect) => void;
};

export const SubSpriteForm = ({ subSprite, onName, onDescription, onRect }: SubSpriteFormProps) => (
  <>
    <label style={editorStyles.field}>
      Name
      <input
        style={editorStyles.input}
        value={subSprite.name}
        placeholder="e.g. door_closed"
        onChange={(event) => onName(event.target.value)}
      />
    </label>
    <label style={editorStyles.field}>
      Description
      <textarea
        style={sheetStyles.textarea}
        value={subSprite.description ?? ""}
        placeholder="What is this sub-sprite?"
        onChange={(event) => onDescription(event.target.value)}
      />
    </label>
    <RectFields rect={subSprite.rect} onChange={onRect} />
  </>
);
