import type { MetadataStore } from "../metadata/useMetadata.ts";
import { AssetRow } from "./AssetRow.tsx";
import { ROW_HEIGHT, styles } from "./browseStyles.ts";
import { FilterControls } from "./FilterControls.tsx";
import { KindChips } from "./KindChips.tsx";
import { useBrowse } from "./useBrowse.ts";
import { VirtualList } from "./VirtualList.tsx";

type BrowseViewProps = {
  store: MetadataStore;
  onEdit: (path: string) => void;
};

export const BrowseView = ({ store, onEdit }: BrowseViewProps) => {
  const browse = useBrowse(store);

  if (browse.status === "loading") {
    return <div style={{ ...styles.page, padding: 20 }}>Loading pack…</div>;
  }
  if (browse.status === "error" || !browse.manifest) {
    return (
      <div style={{ ...styles.page, padding: 20 }}>Error: {browse.error ?? "no manifest"}</div>
    );
  }

  const { root } = browse.manifest;

  return (
    <div style={styles.page}>
      <KindChips
        total={browse.manifest.entries.length}
        summary={browse.summary}
        kindFilter={browse.kindFilter}
        saveState={browse.saveState}
        onSelect={browse.setKindFilter}
      />
      <FilterControls
        query={browse.query}
        doneFilter={browse.doneFilter}
        shown={browse.filtered.length}
        onQuery={browse.setQuery}
        onDoneFilter={browse.setDoneFilter}
      />
      <VirtualList
        items={browse.filtered}
        rowHeight={ROW_HEIGHT}
        rowKey={(row) => row.entry.path}
        renderRow={(row) => (
          <AssetRow row={row} root={root} onKindChange={browse.setKind} onEdit={onEdit} />
        )}
      />
    </div>
  );
};
