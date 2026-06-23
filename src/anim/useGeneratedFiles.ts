import { useEffect, useMemo, useState } from "react";

const SEP = "/";
const ONE = 1;
const PNG_EXT = /\.png$/i;

type GeneratedFilesStatus = "checking" | "missing" | "ready";

export type GeneratedFiles = {
  textureKey: string;
  atlasUrl: string;
  animsUrl: string;
  status: GeneratedFilesStatus;
};

const deriveUrls = (path: string) => {
  const stripped = path.replace(PNG_EXT, "");
  return {
    animsUrl: `/generated/${stripped}.anims.json`,
    atlasUrl: `/generated/${stripped}.atlas.json`,
    textureKey: stripped.slice(stripped.lastIndexOf(SEP) + ONE),
  };
};

const statusFor = (ok: boolean): GeneratedFilesStatus => {
  if (ok) {
    return "ready";
  }
  return "missing";
};

export const useGeneratedFiles = (path: string, reloadToken: number): GeneratedFiles => {
  const urls = useMemo(() => deriveUrls(path), [path]);
  const [status, setStatus] = useState<GeneratedFilesStatus>("checking");

  useEffect(() => {
    let active = true;
    setStatus("checking");
    fetch(urls.atlasUrl)
      .then((response) => {
        if (active) {
          setStatus(statusFor(response.ok));
        }
      })
      .catch(() => {
        if (active) {
          setStatus("missing");
        }
      });
    return () => {
      active = false;
    };
  }, [urls.atlasUrl, reloadToken]);

  return { ...urls, status };
};
