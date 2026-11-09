import { createHash } from "node:crypto";
import { cp, readdir, readFile, writeFile } from "node:fs/promises";
for (const dir of ["content", "assets/qr", "print"])
  await cp(dir, `dist/${dir}`, { recursive: true });
const files = [];
async function walk(dir = "dist") {
  for (const f of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${f.name}`;
    if (f.isDirectory()) await walk(path);
    else if (!path.includes("/print/") && !path.includes("/assets/qr/"))
      files.push("./" + path.slice(5));
  }
}
await walk();
const hash = createHash("sha256");
for (const file of files) hash.update(await readFile("dist/" + file.slice(2)));
const version = hash.digest("hex").slice(0, 16);
const sw = await readFile("src/sw.js", "utf8");
await writeFile(
  "dist/sw.js",
  sw
    .replace("__SHELL__", JSON.stringify(files))
    .replace("__VERSION__", version),
);
