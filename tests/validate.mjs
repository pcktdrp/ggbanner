import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url), "utf8"));
const script = await readFile(new URL("../banner.js", import.meta.url), "utf8");
const css = await readFile(new URL("../banner.css", import.meta.url), "utf8");

assert.equal(manifest.manifest_version, 3, "Manifest V3 is required");
assert.equal(manifest.version, "2.0.0", "Expected initial rebuild version");
assert.equal(manifest.permissions, undefined, "The extension should not request permissions");
assert.equal(manifest.host_permissions, undefined, "The extension should not request host permissions");
assert.ok(manifest.update_url.startsWith("https://"), "Updates must use HTTPS");
assert.ok(manifest.content_scripts.some((entry) => entry.js?.includes("banner.js")));
assert.ok(manifest.content_scripts.some((entry) => entry.css?.includes("banner.css")));
assert.ok(script.includes("Web activity may be monitored and filtered by GoGuardian."));
assert.ok(script.includes("textContent"), "Banner text should be assigned safely");
assert.ok(css.includes("position: sticky"), "Banner should stay unobtrusive in normal page flow");

console.log("Extension source checks passed.");
