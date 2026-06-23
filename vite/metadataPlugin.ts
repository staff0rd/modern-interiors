import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { Plugin } from "vite";

import { errorMessage } from "../src/metadata/errorMessage.ts";
import { emptyMetadata, metadataSchema } from "../src/metadata/schema.ts";
import { GENERATED_DIR, writeGeneratedTree } from "./generateOutput.ts";

const METADATA_FILE = join(process.cwd(), "metadata", "metadata.json");
const MANIFEST_FILE = join(process.cwd(), "metadata", "manifest.json");
const JSON_INDENT = 2;
const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_SERVER_ERROR = 500;
const WRITE_METHODS = new Set(["POST", "PUT"]);

type Responder = {
  setHeader: (key: string, value: string) => void;
  end: (body: string) => void;
  statusCode?: number;
};

type Requester = {
  method?: string;
  on: (event: string, listener: (chunk?: unknown) => void) => void;
};

const readBody = (req: Requester) =>
  new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk as Buffer));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });

const sendJson = (res: Responder, status: number, payload: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const serveFile = async (res: Responder, file: string, missing: () => void) => {
  try {
    const raw = await readFile(file, "utf8");
    res.setHeader("Content-Type", "application/json");
    res.end(raw);
  } catch {
    missing();
  }
};

const putMetadata = async (req: Requester, res: Responder) => {
  try {
    const parsed = metadataSchema.parse(JSON.parse(await readBody(req)));
    await writeFile(METADATA_FILE, `${JSON.stringify(parsed, null, JSON_INDENT)}\n`);
    const generated = await writeGeneratedTree();
    sendJson(res, HTTP_OK, { generated, ok: true });
  } catch (error) {
    sendJson(res, HTTP_BAD_REQUEST, { error: errorMessage(error, "save or generate failed") });
  }
};

export const metadataPlugin = (): Plugin => ({
  config: () => ({
    server: { watch: { ignored: [METADATA_FILE, GENERATED_DIR, `${GENERATED_DIR}/**`] } },
  }),
  configureServer(server) {
    server.middlewares.use("/api/manifest", (_req, res) =>
      serveFile(res, MANIFEST_FILE, () =>
        sendJson(res, HTTP_SERVER_ERROR, {
          error: "manifest.json not found — run `npm run scan-assets`",
        }),
      ),
    );

    server.middlewares.use("/api/metadata", (req, res) => {
      if (req.method === "GET") {
        return serveFile(res, METADATA_FILE, () => sendJson(res, HTTP_OK, emptyMetadata()));
      }
      if (req.method && WRITE_METHODS.has(req.method)) {
        return putMetadata(req, res);
      }
      return sendJson(res, HTTP_METHOD_NOT_ALLOWED, { error: "method not allowed" });
    });
  },
  name: "metadata-authoring-api",
});
