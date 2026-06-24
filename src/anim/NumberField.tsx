import { editorStyles } from "./editorStyles.ts";

type NumberFieldProps = {
  label: string;
  value: number;
  width: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
};

const SINGLE = 1;
const ZERO = 0;

type StepArgs = { raw: number; value: number; step: number; min: number };

// Native number spinners are unreliable for multi-unit steps under a controlled
// Value (they often move by 1 regardless of the step attribute), so when step > 1
// We resolve the change ourselves: a spinner nudge (delta smaller than a step) moves
// One whole step in its direction, and a typed value snaps to the nearest step.
const toStep = ({ raw, value, step, min }: StepArgs): number => {
  const delta = raw - value;
  if (delta !== ZERO && Math.abs(delta) < step) {
    return Math.max(min, value + Math.sign(delta) * step);
  }
  return Math.max(min, min + Math.round((raw - min) / step) * step);
};

export const NumberField = ({ label, value, width, min, step, onChange }: NumberFieldProps) => {
  const resolve = (raw: number): number => {
    if (step !== undefined && step > SINGLE) {
      return toStep({ min: min ?? ZERO, raw, step, value });
    }
    return raw;
  };
  return (
    <label style={editorStyles.field}>
      {label}
      <input
        type="number"
        min={min}
        step={step}
        style={{ ...editorStyles.input, width }}
        value={value}
        onChange={(event) => onChange(resolve(Number(event.target.value)))}
      />
    </label>
  );
};
