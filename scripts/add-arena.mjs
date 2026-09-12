// Screeps: Arena creates a new arena's folder itself (typings/, jsconfig.json,
// main.mjs) the moment you enable "Sync to local folder" for it in-game.
// This script doesn't create a new arena - it adds TypeScript support to one
// the game has already created, by seeding src/main.ts from its existing
// main.mjs and adding a tsconfig.json next to it.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { rootDir } from "./arenas.mjs";

const name = process.argv[2];

if (!name) {
  console.error("Usage: npm run add-arena -- <folder-name>");
  console.error("Example: npm run add-arena -- season5-my_new_arena");
  process.exit(1);
}

const dir = path.join(rootDir, name);

if (!existsSync(dir) || !existsSync(path.join(dir, "typings"))) {
  console.error(
    `"${name}" doesn't look like a game-synced arena folder (no typings/ found).`,
  );
  console.error(
    `Open this arena in the Screeps: Arena client first and enable "Sync to local folder",` +
      ` pointing it at ${name}/ - that's what creates typings/, jsconfig.json, and main.mjs.` +
      ` Then re-run this command.`,
  );
  process.exit(1);
}

const srcMainPath = path.join(dir, "src", "main.ts");
if (existsSync(srcMainPath)) {
  console.log(`"${name}" already has src/main.ts - nothing to do.`);
  process.exit(0);
}

mkdirSync(path.join(dir, "src"), { recursive: true });

const mainMjsPath = path.join(dir, "main.mjs");
const seed = existsSync(mainMjsPath)
  ? readFileSync(mainMjsPath, "utf8")
  : `import {} from "game/utils";
import {} from "game/prototypes";
import {} from "game/constants";

export function loop(): void {
  // Your code goes here
}
`;

writeFileSync(srcMainPath, seed);

writeFileSync(
  path.join(dir, "tsconfig.json"),
  JSON.stringify(
    {
      extends: "../tsconfig.base.json",
      include: ["src/**/*.ts", "typings/**/*.d.ts", "../types/**/*.d.ts"],
    },
    null,
    2,
  ) + "\n",
);

console.log(`Created ${name}/src/main.ts (seeded from its main.mjs) and ${name}/tsconfig.json.`);
console.log(`Run "npm run typecheck" to check it, then "npm run build" to regenerate ${name}/main.mjs from src/main.ts.`);
