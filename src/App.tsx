import { useState, type CSSProperties, type ReactNode } from "react";

import { AnimationEditor } from "./anim/AnimationEditor.tsx";
import { BrowseView } from "./browse/BrowseView.tsx";
import { useMetadata, type MetadataStore } from "./metadata/useMetadata.ts";
import PhaserGame from "./PhaserGame.tsx";
import { SpriteSheetEditor } from "./sheet/SpriteSheetEditor.tsx";
import { SingleEditor } from "./single/SingleEditor.tsx";

type View = "browse" | "viewer";

const navStyle: CSSProperties = {
  background: "#101116",
  borderBottom: "1px solid #2a2c36",
  display: "flex",
  font: "14px system-ui, sans-serif",
  gap: 8,
  padding: "8px 14px",
};

const tabStyle = (active: boolean): CSSProperties => {
  const base: CSSProperties = {
    border: "1px solid #2a2c36",
    borderRadius: 6,
    color: "#e8e8ef",
    cursor: "pointer",
    padding: "5px 14px",
  };
  if (active) {
    return { ...base, background: "#243049", borderColor: "#5b8cff" };
  }
  return { ...base, background: "#1d1f27" };
};

const renderEditor = (store: MetadataStore, path: string, onClose: () => void): ReactNode => {
  const kind =
    store.metadata?.assets[path]?.kind ??
    store.manifest?.entries.find((entry) => entry.path === path)?.kind;
  if (kind === "single") {
    return <SingleEditor key={path} store={store} path={path} onClose={onClose} />;
  }
  if (kind === "spritesheet") {
    return <SpriteSheetEditor key={path} store={store} path={path} onClose={onClose} />;
  }
  return <AnimationEditor key={path} store={store} path={path} onClose={onClose} />;
};

const App = () => {
  const store = useMetadata();
  const [view, setView] = useState<View>("browse");
  const [editing, setEditing] = useState<string | null>(null);

  let content: ReactNode = <PhaserGame />;
  if (view === "browse") {
    content = <BrowseView store={store} onEdit={setEditing} />;
    if (editing !== null) {
      content = renderEditor(store, editing, () => setEditing(null));
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <nav style={navStyle}>
        <button type="button" style={tabStyle(view === "browse")} onClick={() => setView("browse")}>
          Browse
        </button>
        <button type="button" style={tabStyle(view === "viewer")} onClick={() => setView("viewer")}>
          Viewer
        </button>
      </nav>
      <div style={{ flex: 1, minHeight: 0 }}>{content}</div>
    </div>
  );
};

export default App;
