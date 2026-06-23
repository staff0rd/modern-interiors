import { useState, type CSSProperties } from "react";

import { EditorHeader } from "../anim/EditorHeader.tsx";
import { editorStyles } from "../anim/editorStyles.ts";
import { SAVE_LABELS } from "../metadata/saveLabels.ts";
import { ORIENTATION_VALUES, type Orientation } from "../metadata/schema.ts";
import type { MetadataStore } from "../metadata/useMetadata.ts";

const UNSET = "";
const PREVIEW_SIZE = 220;

const layout: CSSProperties = { display: "flex", flex: 1, gap: 24, minHeight: 0, padding: 16 };
const form: CSSProperties = { display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 };
const textarea: CSSProperties = { ...editorStyles.input, minHeight: 120, resize: "vertical" };
const previewBox: CSSProperties = {
  background: "#0d0e12",
  border: "1px solid #2a2c36",
  borderRadius: 6,
  flexShrink: 0,
  height: PREVIEW_SIZE,
  imageRendering: "pixelated",
  objectFit: "contain",
  padding: 8,
  width: PREVIEW_SIZE,
};

const orientationValue = (value: string): Orientation | undefined => {
  if (value === UNSET) {
    return undefined;
  }
  return value as Orientation;
};

type SingleEditorProps = {
  store: MetadataStore;
  path: string;
  onClose: () => void;
};

export const SingleEditor = ({ store, path, onClose }: SingleEditorProps) => {
  const { manifest, metadata, saveState, setDescription, setOrientation } = store;
  const entry = manifest?.entries.find((candidate) => candidate.path === path);
  const meta = metadata?.assets[path];
  const [description, setDraft] = useState(meta?.description ?? UNSET);

  if (!entry) {
    return <div style={{ ...editorStyles.page, padding: 20 }}>Asset not found in manifest.</div>;
  }

  const commitDescription = () => {
    const trimmed = description.trim();
    if (trimmed.length > UNSET.length) {
      setDescription(path, trimmed);
      return;
    }
    setDescription(path, undefined);
  };

  return (
    <div style={editorStyles.page}>
      <EditorHeader path={path} onClose={onClose} />
      <div style={layout}>
        <img style={previewBox} src={`/${manifest?.root}/${path}`} alt="" />
        <div style={form}>
          <label style={editorStyles.field}>
            Description
            <textarea
              style={textarea}
              value={description}
              placeholder="What is this sprite?"
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commitDescription}
            />
          </label>
          <label style={editorStyles.field}>
            Orientation
            <select
              style={editorStyles.input}
              value={meta?.orientation ?? UNSET}
              onChange={(event) => setOrientation(path, orientationValue(event.target.value))}
            >
              <option value={UNSET}>— not set —</option>
              {ORIENTATION_VALUES.map((orientation) => (
                <option key={orientation} value={orientation}>
                  {orientation}
                </option>
              ))}
            </select>
          </label>
          <span style={{ color: "#8a8d9b", fontSize: 12 }}>{SAVE_LABELS[saveState]}</span>
        </div>
      </div>
    </div>
  );
};
