import * as esbuild from "esbuild";
import { findArenas, rootDir } from "./arenas.mjs";
import path from "node:path";

const watch = process.argv.includes("--watch");
const arenas = findArenas();

if (arenas.length === 0) {
  console.log("No arenas found (expected <name>/src/main.ts + <name>/typings/).");
  process.exit(0);
}

const buildOptions = (arena) => ({
  entryPoints: [arena.entry],
  outfile: arena.outfile,
  bundle: true,
  format: "esm",
  target: "es2020",
  platform: "neutral",
  logLevel: "info",
  // Everything under "game/" and "arena/" is provided by the Screeps: Arena
  // runtime itself - it must stay as a bare import, never get bundled.
  external: ["game", "game/*", "arena", "arena/*"],
  // Mirrors the "common/*" path in tsconfig.base.json, so code shared across
  // arenas gets bundled straight into each arena's main.mjs.
  alias: { common: path.join(rootDir, "common") },
});

if (watch) {
  const contexts = await Promise.all(
    arenas.map((arena) => esbuild.context(buildOptions(arena))),
  );
  await Promise.all(contexts.map((ctx) => ctx.watch()));
  console.log(`Watching ${arenas.length} arena(s) for changes: ${arenas.map((a) => a.name).join(", ")}`);
} else {
  for (const arena of arenas) {
    await esbuild.build(buildOptions(arena));
  }
  console.log(`Built ${arenas.length} arena(s): ${arenas.map((a) => a.name).join(", ")}`);
}
