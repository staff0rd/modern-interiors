import { editorStyles } from "../anim/editorStyles.ts";
import { NumberField } from "../anim/NumberField.tsx";
import type { GroupTemplate } from "../metadata/schema.ts";
import { sheetStyles } from "./sheetStyles.ts";

const CELL_FIELD_WIDTH = 64;
const MIN_CELL = 1;

const parseVariants = (text: string): string[] => text.split("\n").map((line) => line.trim());

type GroupTemplateFormProps = {
  template: GroupTemplate;
  onChange: (template: GroupTemplate) => void;
};

export const GroupTemplateForm = ({ template, onChange }: GroupTemplateFormProps) => (
  <div style={editorStyles.field}>
    <span style={{ fontWeight: 600 }}>Group template</span>
    <p style={sheetStyles.hint}>
      Cell size and the variant names reused for every new group on this sheet.
    </p>
    <div style={sheetStyles.rectRow}>
      <NumberField
        label="Cell W"
        value={template.cellWidth}
        width={CELL_FIELD_WIDTH}
        min={MIN_CELL}
        onChange={(cellWidth) => onChange({ ...template, cellWidth })}
      />
      <NumberField
        label="Cell H"
        value={template.cellHeight}
        width={CELL_FIELD_WIDTH}
        min={MIN_CELL}
        onChange={(cellHeight) => onChange({ ...template, cellHeight })}
      />
    </div>
    <label style={editorStyles.field}>
      Variant names (one per line)
      <textarea
        style={sheetStyles.textarea}
        value={template.variantNames.join("\n")}
        placeholder={"top-left-shadow\ntop-shadow\nleft-shadow\nnone"}
        onChange={(event) =>
          onChange({ ...template, variantNames: parseVariants(event.target.value) })
        }
      />
    </label>
  </div>
);
