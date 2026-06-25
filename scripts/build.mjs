import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

import { build } from "esbuild";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, "public"), dist, { recursive: true });
await cp(join(root, "src/ui"), dist, { recursive: true });

await build({
  entryPoints: {
    background: join(root, "src/background/service-worker.ts"),
    content: join(root, "src/content/index.ts"),
    popup: join(root, "src/popup/index.ts"),
    options: join(root, "src/options/index.ts"),
  },
  outdir: dist,
  bundle: true,
  format: "esm",
  target: "chrome120",
  minify: true,
  sourcemap: false,
  legalComments: "none",
});
