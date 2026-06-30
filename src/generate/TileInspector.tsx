import type { Palette, PaletteEntry } from "./palette.ts";
import { PaintPanel } from "./PaintPanel.tsx";
import { columns, styles, swatchStyle } from "./generateStyles.ts";
import { cropStyle } from "./tileSheet.ts";

const PALETTE_SCALE = 3;
const EMPTY = 0;
const ONE = 1;

type SwatchProps = {
  entry: PaletteEntry;
  active: boolean;
  onSelect: (token: string) => void;
};

const Swatch = ({ entry, active, onSelect }: SwatchProps) => (
  <button
    style={{
      ...swatchStyle(active),
      gridColumnStart: entry.col + ONE,
      gridRowStart: entry.row + ONE,
    }}
    onClick={() => onSelect(entry.token)}
    title={entry.token}
  >
    <div style={cropStyle(entry.rect, entry.image, PALETTE_SCALE)} />
  </button>
);

type SectionProps = {
  title: string;
  entries: PaletteEntry[];
  selected: string;
  onSelect: (token: string) => void;
  empty: string;
};

const Section = ({ title, entries, selected, onSelect, empty }: SectionProps) => {
  const colCount = entries.reduce((max, entry) => Math.max(max, entry.col + ONE), ONE);
  return (
    <>
      <strong>{title}</strong>
      {entries.length === EMPTY && <div style={styles.meta}>{empty}</div>}
      <div style={columns(colCount)}>
        {entries.map((entry) => (
          <Swatch
            key={entry.token}
            entry={entry}
            active={entry.token === selected}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  );
};

type WallGroupPickerProps = {
  groups: string[];
  selected: string | undefined;
  onSelect: (name: string) => void;
};

const WallGroupPicker = ({ groups, selected, onSelect }: WallGroupPickerProps) => {
  if (!groups.length) {
    return null;
  }
  return (
    <label style={styles.meta}>
      Wall group{" "}
      <select
        style={styles.field}
        value={selected ?? ""}
        onChange={(event) => onSelect(event.target.value)}
      >
        {groups.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
};

type InspectorProps = {
  palette: Palette;
  selected: string;
  onSelect: (token: string) => void;
  onClear: () => void;
  wallGroups: string[];
  wallGroup: string | undefined;
  onWallGroup: (name: string) => void;
};

export const TileInspector = ({
  palette,
  selected,
  onSelect,
  onClear,
  wallGroups,
  wallGroup,
  onWallGroup,
}: InspectorProps) => {
  if (!palette.walls.length && !palette.floors.length) {
    return <div style={styles.inspector}>Loading tiles…</div>;
  }
  const current = [...palette.walls, ...palette.floors].find((entry) => entry.token === selected);
  return (
    <div style={styles.inspector}>
      <WallGroupPicker groups={wallGroups} selected={wallGroup} onSelect={onWallGroup} />
      <Section
        title="Walls"
        entries={palette.walls}
        selected={selected}
        onSelect={onSelect}
        empty="No wall group defined yet."
      />
      <Section
        title="Floors"
        entries={palette.floors}
        selected={selected}
        onSelect={onSelect}
        empty="No floor group defined yet."
      />
      {current && <PaintPanel entry={current} onClear={onClear} />}
    </div>
  );
};
