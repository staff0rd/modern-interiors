import { type ReactNode } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";

import { BrowseView } from "./browse/BrowseView.tsx";
import { editTo, EditorBody } from "./EditorView.tsx";
import { useMetadata, type MetadataStore } from "./metadata/useMetadata.ts";

const Message = ({ text }: { text: string }): ReactNode => (
  <div style={{ color: "#e8e8ef", font: "14px system-ui, sans-serif", padding: 20 }}>{text}</div>
);

const EditorRoute = ({ store }: { store: MetadataStore }): ReactNode => {
  const path = useParams()["*"] ?? "";
  const navigate = useNavigate();
  if (store.status === "loading") {
    return <Message text="Loading…" />;
  }
  if (store.status === "error" || !store.manifest || !store.metadata) {
    return <Message text={`Error: ${store.error ?? "metadata unavailable"}`} />;
  }
  return (
    <EditorBody
      store={store}
      manifest={store.manifest}
      metadata={store.metadata}
      path={path}
      navigate={navigate}
    />
  );
};

const App = () => {
  const store = useMetadata();
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Routes>
        <Route
          path="/"
          element={<BrowseView store={store} onEdit={(path) => navigate(editTo(path))} />}
        />
        <Route path="/edit/*" element={<EditorRoute store={store} />} />
      </Routes>
    </div>
  );
};

export default App;
