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

type InspectorProps = {
  palette: Palette;
  selected: string;
  onSelect: (token: string) => void;
  onClear: () => void;
};

export const TileInspector = ({ palette, selected, onSelect, onClear }: InspectorProps) => {
  if (!palette.walls.length && !palette.floors.length) {
    return <div style={styles.inspector}>Loading tiles…</div>;
  }
  const current = [...palette.walls, ...palette.floors].find((entry) => entry.token === selected);
  return (
    <div style={styles.inspector}>
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
