import { editorStyles } from "../anim/editorStyles.ts";
import type { SubSprite } from "../metadata/schema.ts";
import { sheetStyles } from "./sheetStyles.ts";

const MAX_DETAIL = 360;
const MIN_ZOOM = 2;
const ONE = 1;

const detailZoom = (subSprite: SubSprite): number => {
  const longest = Math.max(subSprite.rect.width, subSprite.rect.height, ONE);
  return Math.max(MIN_ZOOM, Math.floor(MAX_DETAIL / longest));
};

type SubSpriteDetailProps = {
  subSprite: SubSprite;
  url: string;
  sheetWidth: number;
  sheetHeight: number;
  onName: (name: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
};

export const SubSpriteDetail = ({
  subSprite,
  url,
  sheetWidth,
  sheetHeight,
  onName,
  onPrev,
  onNext,
  onClose,
}: SubSpriteDetailProps) => {
  const zoom = detailZoom(subSprite);
  return (
    <div style={sheetStyles.detailArea}>
      <div style={sheetStyles.detailHeader}>
        <input
          style={{ ...editorStyles.input, flex: 1 }}
          value={subSprite.name}
          placeholder="e.g. door_closed"
          onChange={(event) => onName(event.target.value)}
        />
        <button
          type="button"
          style={sheetStyles.rowAction}
          title="Previous sub-sprite"
          onClick={onPrev}
        >
          ‹
        </button>
        <button
          type="button"
          style={sheetStyles.rowAction}
          title="Next sub-sprite"
          onClick={onNext}
        >
          ›
        </button>
        <button type="button" style={sheetStyles.rowAction} title="Deselect" onClick={onClose}>
          ✕
        </button>
      </div>
      <div
        style={{
          ...sheetStyles.detailFrame,
          height: subSprite.rect.height * zoom,
          width: subSprite.rect.width * zoom,
        }}
      >
        <img
          style={{
            ...sheetStyles.detailImage,
            height: sheetHeight * zoom,
            left: -subSprite.rect.left * zoom,
            top: -subSprite.rect.top * zoom,
            width: sheetWidth * zoom,
          }}
          src={url}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  );
};
