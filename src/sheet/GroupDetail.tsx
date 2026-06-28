import { editorStyles } from "../anim/editorStyles.ts";
import type { SubSpriteGroup } from "../metadata/schema.ts";
import { GroupDetailCell } from "./GroupDetailCell.tsx";
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
  selectedTileIndex: number;
  onName: (name: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onSelectTile: (index: number) => void;
};

export const GroupDetail = ({
  group,
  url,
  sheetWidth,
  sheetHeight,
  selectedTileIndex,
  onName,
  onPrev,
  onNext,
  onClose,
  onSelectTile,
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
          <GroupDetailCell
            key={cell.index}
            cell={cell}
            zoom={zoom}
            cellWidth={group.cellWidth}
            cellHeight={group.cellHeight}
            selected={cell.index === selectedTileIndex}
            onSelect={onSelectTile}
          />
        ))}
      </div>
    </div>
  );
};
