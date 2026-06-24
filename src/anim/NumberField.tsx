import { editorStyles } from "./editorStyles.ts";

type NumberFieldProps = {
  label: string;
  value: number;
  width: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
};

export const NumberField = ({ label, value, width, min, step, onChange }: NumberFieldProps) => (
  <label style={editorStyles.field}>
    {label}
    <input
      type="number"
      min={min}
      step={step}
      style={{ ...editorStyles.input, width }}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </label>
);
