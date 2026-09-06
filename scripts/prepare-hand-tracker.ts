import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// Serve the pinned runtime locally. These generated assets are not application code.
const require = createRequire(import.meta.url);
const source = dirname(require.resolve("@mediapipe/tasks-vision"));
const destination = join(process.cwd(), "public/hand-tracker");
async function prepare() {
  await mkdir(join(destination, "wasm"), { recursive: true });
  for (const name of [
    "vision_bundle.js",
    "wasm/vision_wasm_internal.js",
    "wasm/vision_wasm_internal.wasm",
    "wasm/vision_wasm_nosimd_internal.js",
    "wasm/vision_wasm_nosimd_internal.wasm",
    "wasm/vision_wasm_module_internal.js",
    "wasm/vision_wasm_module_internal.wasm",
  ]) {
    await copyFile(join(source, name), join(destination, name));
  }
}
void prepare().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
