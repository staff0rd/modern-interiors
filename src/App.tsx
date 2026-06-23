import { type ReactNode } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";

import { AnimationEditor } from "./anim/AnimationEditor.tsx";
import { BrowseView } from "./browse/BrowseView.tsx";
import { useMetadata, type MetadataStore } from "./metadata/useMetadata.ts";
import { SpriteSheetEditor } from "./sheet/SpriteSheetEditor.tsx";
import { SingleEditor } from "./single/SingleEditor.tsx";

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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Routes>
        <Route
          path="/"
          element={
            <BrowseView store={store} onEdit={(path) => navigate(`/edit/${encodeURI(path)}`)} />
          }
        />
        <Route path="/edit/*" element={<EditorRoute store={store} />} />
      </Routes>
    </div>
  );
};

export default App;
