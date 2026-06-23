import { relative } from "node:path";

import { GENERATED_DIR, writeGeneratedTree } from "../vite/generateOutput.ts";

const count = await writeGeneratedTree();
console.log(`Generated ${count} files -> ${relative(process.cwd(), GENERATED_DIR)}`);
