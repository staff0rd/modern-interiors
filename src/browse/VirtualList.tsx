import { useEffect, useRef, useState, type ReactNode } from "react";

const DEFAULT_OVERSCAN = 6;
const INITIAL_MEASURE = 0;
const MIN_INDEX = 0;
const OVERSCAN_SIDES = 2;

type VirtualListProps<Item> = {
  items: Item[];
  rowHeight: number;
  renderRow: (item: Item, index: number) => ReactNode;
  rowKey: (item: Item, index: number) => string;
  overscan?: number;
};

export const VirtualList = <Item,>({
  items,
  rowHeight,
  renderRow,
  rowKey,
  overscan = DEFAULT_OVERSCAN,
}: VirtualListProps<Item>) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(INITIAL_MEASURE);
  const [viewportHeight, setViewportHeight] = useState(INITIAL_MEASURE);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(() => setViewportHeight(element.clientHeight));
    observer.observe(element);
    setViewportHeight(element.clientHeight);
    return () => observer.disconnect();
  }, []);

  const startIndex = Math.max(MIN_INDEX, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan * OVERSCAN_SIDES;
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  const visible = items.slice(startIndex, endIndex);

  return (
    <div
      ref={scrollRef}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      style={{ flex: 1, overflow: "auto" }}
    >
      <div style={{ height: items.length * rowHeight, position: "relative" }}>
        <div style={{ left: 0, position: "absolute", right: 0, top: startIndex * rowHeight }}>
          {visible.map((item, offset) => (
            <div key={rowKey(item, startIndex + offset)} style={{ height: rowHeight }}>
              {renderRow(item, startIndex + offset)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
