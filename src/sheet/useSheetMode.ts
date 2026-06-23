import { useSearchParams } from "react-router-dom";

import type { SheetMode } from "./SheetPanel.tsx";

const MODE_PARAM = "mode";

const resolveMode = (value: string | null): SheetMode => {
  if (value === "sub") {
    return "sub";
  }
  return "group";
};

export const useSheetMode = (): [SheetMode, (mode: SheetMode) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = resolveMode(searchParams.get(MODE_PARAM));
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
