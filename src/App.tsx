import { type CSSProperties, type ReactNode } from "react";
import { Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";

import { AnimationEditor } from "./anim/AnimationEditor.tsx";
import { BrowseView } from "./browse/BrowseView.tsx";
import { useMetadata, type MetadataStore } from "./metadata/useMetadata.ts";
import PhaserGame from "./PhaserGame.tsx";
import { SpriteSheetEditor } from "./sheet/SpriteSheetEditor.tsx";
import { SingleEditor } from "./single/SingleEditor.tsx";

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
    return { ...base, background: "#243049", border: "1px solid #5b8cff" };
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

const EditorRoute = ({ store }: { store: MetadataStore }): ReactNode => {
  const path = useParams()["*"] ?? "";
  const navigate = useNavigate();
  return renderEditor(store, path, () => navigate("/"));
};

const App = () => {
  const store = useMetadata();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <nav style={navStyle}>
        <button
          type="button"
          style={tabStyle(pathname !== "/viewer")}
          onClick={() => navigate("/")}
        >
          Browse
        </button>
        <button
          type="button"
          style={tabStyle(pathname === "/viewer")}
          onClick={() => navigate("/viewer")}
        >
          Viewer
        </button>
      </nav>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Routes>
          <Route
            path="/"
            element={
              <BrowseView store={store} onEdit={(path) => navigate(`/edit/${encodeURI(path)}`)} />
            }
          />
          <Route path="/viewer" element={<PhaserGame />} />
          <Route path="/edit/*" element={<EditorRoute store={store} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
