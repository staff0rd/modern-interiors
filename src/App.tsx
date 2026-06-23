import { useState, type CSSProperties } from "react";

import { AnimationEditor } from "./anim/AnimationEditor.tsx";
import { BrowseView } from "./browse/BrowseView.tsx";
import { useMetadata } from "./metadata/useMetadata.ts";
import PhaserGame from "./PhaserGame.tsx";

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

const App = () => {
  const store = useMetadata();
  const [view, setView] = useState<View>("browse");
  const [editing, setEditing] = useState<string | null>(null);

  let content = <PhaserGame />;
  if (view === "browse") {
    content = <BrowseView store={store} onEdit={setEditing} />;
    if (editing !== null) {
      content = (
        <AnimationEditor
          key={editing}
          store={store}
          path={editing}
          onClose={() => setEditing(null)}
        />
      );
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
