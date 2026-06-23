import { editorStyles } from "../anim/editorStyles.ts";
import type { SubSpriteGroup } from "../metadata/schema.ts";
import { groupCells } from "./groupCells.ts";
import { sheetStyles } from "./sheetStyles.ts";

const MAX_DETAIL = 360;
const MIN_ZOOM = 2;
const ONE = 1;

const detailZoom = (group: SubSpriteGroup): number => {
  const longest = Math.max(group.rect.width, group.rect.height, ONE);
  return Math.max(MIN_ZOOM, Math.floor(MAX_DETAIL / longest));
};

type GroupDetailProps = {
  group: SubSpriteGroup;
  url: string;
  sheetWidth: number;
  sheetHeight: number;
  onName: (name: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
};

export const GroupDetail = ({
  group,
  url,
  sheetWidth,
  sheetHeight,
  onName,
  onPrev,
  onNext,
  onClose,
}: GroupDetailProps) => {
  const zoom = detailZoom(group);
  return (
    <div style={sheetStyles.detailArea}>
      <div style={sheetStyles.detailHeader}>
        <input
          style={{ ...editorStyles.input, flex: 1 }}
          value={group.name}
          placeholder="e.g. yellow_floor"
          onChange={(event) => onName(event.target.value)}
        />
        <button type="button" style={sheetStyles.rowAction} title="Previous group" onClick={onPrev}>
          ‹
        </button>
        <button type="button" style={sheetStyles.rowAction} title="Next group" onClick={onNext}>
          ›
        </button>
        <button type="button" style={sheetStyles.rowAction} title="Deselect" onClick={onClose}>
          ✕
        </button>
      </div>
      <div
        style={{
          ...sheetStyles.detailFrame,
          height: group.rect.height * zoom,
          width: group.rect.width * zoom,
        }}
      >
        <img
          style={{
            ...sheetStyles.detailImage,
            height: sheetHeight * zoom,
            left: -group.rect.left * zoom,
            top: -group.rect.top * zoom,
            width: sheetWidth * zoom,
          }}
          src={url}
          alt=""
          draggable={false}
        />
        {groupCells(group).map((cell) => (
          <div
            key={cell.index}
            style={{
              ...sheetStyles.cell,
              height: group.cellHeight * zoom,
              left: cell.col * group.cellWidth * zoom,
              top: cell.row * group.cellHeight * zoom,
              width: group.cellWidth * zoom,
            }}
          >
            <span style={sheetStyles.cellLabel}>{cell.name || cell.index}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
