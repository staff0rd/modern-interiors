import { styles } from "./generateStyles.ts";

const identity = (value: string): string => value;
const sheetLabel = (path: string): string => path.split("/").pop() ?? path;

type PickerProps = {
  label: string;
  options: string[];
  selected: string | undefined;
  onSelect: (name: string) => void;
  optionLabel?: (value: string) => string;
};

const Picker = ({ label, options, selected, onSelect, optionLabel = identity }: PickerProps) => {
  if (!options.length) {
    return null;
  }
  return (
    <label style={styles.meta}>
      {label}{" "}
      <select
        style={styles.field}
        value={selected ?? ""}
        onChange={(event) => onSelect(event.target.value)}
      >
        {options.map((value) => (
          <option key={value} value={value}>
            {optionLabel(value)}
          </option>
        ))}
      </select>
    </label>
  );
};

type WallPickersProps = {
  wallSheets: string[];
  wallSheet: string | undefined;
  onWallSheet: (name: string) => void;
  wallGroups: string[];
  wallGroup: string | undefined;
  onWallGroup: (name: string) => void;
};

export const WallPickers = ({
  wallSheets,
  wallSheet,
  onWallSheet,
  wallGroups,
  wallGroup,
  onWallGroup,
}: WallPickersProps) => (
  <>
    <Picker
      label="Wall sheet"
      options={wallSheets}
      selected={wallSheet}
      onSelect={onWallSheet}
      optionLabel={sheetLabel}
    />
    <Picker label="Wall group" options={wallGroups} selected={wallGroup} onSelect={onWallGroup} />
  </>
);
