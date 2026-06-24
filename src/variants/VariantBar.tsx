import type { CSSProperties } from "react";

import type { VariantMember, VariantRole } from "../metadata/variants.ts";

const bar: CSSProperties = {
  alignItems: "center",
  background: "#15161c",
  borderBottom: "1px solid #2a2c36",
  color: "#8a8d9b",
  display: "flex",
  flexShrink: 0,
  flexWrap: "wrap",
  fontSize: 12,
  gap: 8,
  padding: "6px 16px",
};

const chipBase: CSSProperties = {
  background: "#1d1f27",
  border: "1px solid #2a2c36",
  borderRadius: 6,
  color: "#cfd2dc",
  cursor: "pointer",
  padding: "3px 10px",
};

const activeChip: CSSProperties = {
  background: "#243049",
  border: "1px solid #5b8cff",
  color: "#e8e8ef",
};

const chipStyle = (isCurrent: boolean): CSSProperties => {
  if (isCurrent) {
    return { ...chipBase, ...activeChip };
  }
  return chipBase;
};

const ROLE_LABEL: Record<VariantRole, string> = {
  canonical: "canonical",
  derived: "derived",
  detached: "detached",
  none: "unauthored",
};

type VariantBarProps = {
  members: VariantMember[];
  current: string;
  onOpen: (path: string) => void;
};

export const VariantBar = ({ members, current, onOpen }: VariantBarProps) => (
  <div style={bar}>
    <span>Sizes:</span>
    {members.map((member) => {
      const isCurrent = member.path === current;
      return (
        <button
          key={member.path}
          type="button"
          disabled={isCurrent}
          style={chipStyle(isCurrent)}
          title={member.path}
          onClick={() => onOpen(member.path)}
        >
          {member.size ?? "?"} · {ROLE_LABEL[member.role]}
        </button>
      );
    })}
  </div>
);
