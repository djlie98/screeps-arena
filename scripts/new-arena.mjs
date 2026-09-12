import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { rootDir } from "./arenas.mjs";

const name = process.argv[2];

if (!name) {
  console.error("Usage: npm run new-arena -- <folder-name>");
  console.error("Example: npm run new-arena -- season5-my_new_arena");
  process.exit(1);
}

const dir = path.join(rootDir, name);

if (existsSync(dir)) {
  console.error(`"${name}" already exists.`);
  process.exit(1);
}

mkdirSync(path.join(dir, "src"), { recursive: true });

writeFileSync(
  path.join(dir, "src", "main.ts"),
  `import {} from "game/utils";
import {} from "game/prototypes";
import {} from "game/constants";

export function loop(): void {
  // Your code goes here
}
`,
);

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

console.log(`Created ${name}/src/main.ts and ${name}/tsconfig.json.`);
console.log(
  `Next: in the Screeps Arena client, open this arena and enable "Sync to local folder",` +
    ` pointing it at ${name}/. That will create ${name}/typings/ and ${name}/jsconfig.json` +
    ` (the jsconfig.json is only used by the game client - our own tooling uses tsconfig.json).`,
);
console.log(`Then run "npm run build" to generate ${name}/main.mjs.`);
