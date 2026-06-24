import { useSearchParams } from "react-router-dom";

import type { SheetMode } from "./SheetPanel.tsx";

const MODE_PARAM = "mode";

const resolveMode = (value: string | null, fallback: SheetMode): SheetMode => {
  if (value === "sub") {
    return "sub";
  }
  if (value === "group") {
    return "group";
  }
  return fallback;
};

export const useSheetMode = (fallback: SheetMode): [SheetMode, (mode: SheetMode) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = resolveMode(searchParams.get(MODE_PARAM), fallback);
  const setMode = (next: SheetMode) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        params.set(MODE_PARAM, next);
        return params;
      },
      { replace: true },
    );
  };
  return [mode, setMode];
};
