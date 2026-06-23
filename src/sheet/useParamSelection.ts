import { useSearchParams } from "react-router-dom";

const NONE = -1;
const FIRST = 0;
const ZERO = 0;
const DESELECTED = "none";

const initialSelection = (count: number): number => {
  if (count > ZERO) {
    return FIRST;
  }
  return NONE;
};

const resolveSelection = (param: string | null, count: number): number => {
  if (param === DESELECTED) {
    return NONE;
  }
  if (param !== null) {
    const parsed = Number(param);
    if (Number.isInteger(parsed) && parsed >= ZERO && parsed < count) {
      return parsed;
    }
  }
  return initialSelection(count);
};

const paramValue = (index: number): string => {
  if (index === NONE) {
    return DESELECTED;
  }
  return String(index);
};

export const useParamSelection = (
  key: string,
  count: number,
): [number, (index: number) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIndex = resolveSelection(searchParams.get(key), count);
  const setSelectedIndex = (index: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(key, paramValue(index));
        return next;
      },
      { replace: true },
    );
  };
  return [selectedIndex, setSelectedIndex];
};
