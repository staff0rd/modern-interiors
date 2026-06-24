import type { CSSProperties } from "react";

const banner: CSSProperties = {
  alignItems: "center",
  background: "#1a1f2e",
  borderBottom: "1px solid #2a2c36",
  color: "#cfd2dc",
  display: "flex",
  flexShrink: 0,
  flexWrap: "wrap",
  fontSize: 12,
  gap: 10,
  justifyContent: "space-between",
  padding: "8px 16px",
};

const link: CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#5b8cff",
  cursor: "pointer",
  font: "inherit",
  padding: 0,
  textDecoration: "underline",
};

const detach: CSSProperties = {
  background: "#243049",
  border: "1px solid #5b8cff",
  borderRadius: 6,
  color: "#e8e8ef",
  cursor: "pointer",
  padding: "4px 12px",
};

type DetachBannerProps = {
  canonicalPath: string;
  ratio: number;
  onOpen: (path: string) => void;
  onDetach: () => void;
};

export const DetachBanner = ({ canonicalPath, ratio, onOpen, onDetach }: DetachBannerProps) => (
  <div style={banner}>
    <span>
      Read-only — derived (scaled {ratio}×) from canonical{" "}
      <button type="button" style={link} onClick={() => onOpen(canonicalPath)}>
        {canonicalPath}
      </button>
      . Edit the canonical to change every size at once.
    </span>
    <button type="button" style={detach} onClick={onDetach}>
      Detach to override
    </button>
  </div>
);
