import { type ReactNode } from "react";

import { AnimationEditor } from "./anim/AnimationEditor.tsx";
import type { EditorNav } from "./anim/EditorHeader.tsx";
import type { Kind, Manifest, Metadata } from "./metadata/schema.ts";
import type { MetadataStore } from "./metadata/useMetadata.ts";
import type { ResolvedMetadata, VariantMember } from "./metadata/variants.ts";
import { SpriteSheetEditor } from "./sheet/SpriteSheetEditor.tsx";
import { SingleEditor } from "./single/SingleEditor.tsx";
import { DetachBanner } from "./variants/DetachBanner.tsx";
import { useEditorNav, useVariants } from "./variants/editorHooks.ts";
import { readOnlyStore } from "./variants/readOnlyStore.ts";
import { VariantBar } from "./variants/VariantBar.tsx";

const SOLO = 1;
const DEFAULT_KIND: Kind = "animation";

export const editTo = (path: string): string => `/edit/${encodeURI(path)}`;

type EditorComponent = (props: {
  store: MetadataStore;
  path: string;
  onClose: () => void;
  nav?: EditorNav;
  readOnly?: boolean;
  notice?: ReactNode;
}) => ReactNode;

const KIND_EDITORS: Record<Kind, EditorComponent> = {
  animation: AnimationEditor,
  single: SingleEditor,
  spritesheet: SpriteSheetEditor,
};

type EditorContentProps = {
  store: MetadataStore;
  manifest: Manifest;
  path: string;
  resolved: ResolvedMetadata;
  onClose: () => void;
  onOpen: (path: string) => void;
  nav?: EditorNav;
};

type KindEditorProps = Omit<EditorContentProps, "onOpen"> & {
  readOnly?: boolean;
  notice?: ReactNode;
};

const KindEditor = ({
  store,
  manifest,
  path,
  resolved,
  onClose,
  nav,
  readOnly,
  notice,
}: KindEditorProps): ReactNode => {
  const entryKind = manifest.entries.find((entry) => entry.path === path)?.kind;
  const Editor = KIND_EDITORS[resolved.meta.kind ?? entryKind ?? DEFAULT_KIND];
  return (
    <Editor
      key={path}
      store={store}
      path={path}
      onClose={onClose}
      nav={nav}
      readOnly={readOnly}
      notice={notice}
    />
  );
};

const DerivedEditor = ({
  store,
  manifest,
  path,
  resolved,
  onClose,
  onOpen,
  nav,
}: EditorContentProps): ReactNode => (
  <KindEditor
    store={readOnlyStore(store, path, resolved.meta)}
    manifest={manifest}
    path={path}
    resolved={resolved}
    onClose={onClose}
    nav={nav}
    readOnly
    notice={
      <DetachBanner
        canonicalPath={resolved.canonicalPath ?? ""}
        ratio={resolved.ratio}
        onOpen={onOpen}
        onDetach={() => store.detachVariant(path, resolved.meta)}
      />
    }
  />
);

const EditorContent = (props: EditorContentProps): ReactNode => {
  if (props.resolved.source === "derived") {
    return <DerivedEditor {...props} />;
  }
  return <KindEditor {...props} />;
};

type EditorBodyProps = {
  store: MetadataStore;
  manifest: Manifest;
  metadata: Metadata;
  path: string;
  navigate: (to: string) => void;
};

type EditorFrameProps = {
  members: VariantMember[];
  path: string;
  onOpen: (path: string) => void;
  children: ReactNode;
};

const EditorFrame = ({ members, path, onOpen, children }: EditorFrameProps): ReactNode => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    {members.length > SOLO && <VariantBar members={members} current={path} onOpen={onOpen} />}
    <div style={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
      {children}
    </div>
  </div>
);

export const EditorBody = ({
  store,
  manifest,
  metadata,
  path,
  navigate,
}: EditorBodyProps): ReactNode => {
  const { resolved, members } = useVariants(manifest, metadata, path);
  const onClose = () => navigate("/");
  const onOpen = (target: string) => navigate(editTo(target));
  const nav = useEditorNav({ manifest, metadata, onOpen, path });
  return (
    <EditorFrame members={members} path={path} onOpen={onOpen}>
      <EditorContent
        store={store}
        manifest={manifest}
        path={path}
        resolved={resolved}
        onClose={onClose}
        onOpen={onOpen}
        nav={nav}
      />
    </EditorFrame>
  );
};
