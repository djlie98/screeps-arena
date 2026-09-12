import { spawnSync } from "node:child_process";
import { findArenas } from "./arenas.mjs";

const arenas = findArenas();
let failed = false;

for (const arena of arenas) {
  console.log(`\n> tsc --noEmit -p ${arena.name}/tsconfig.json`);
  const result = spawnSync(
    "npx",
    ["tsc", "--noEmit", "-p", arena.tsconfig],
    { stdio: "inherit" },
  );
  if (result.status !== 0) {
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
