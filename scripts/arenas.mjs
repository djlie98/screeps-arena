import { readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = fileURLToPath(new URL("..", import.meta.url));

/**
 * An "arena" is any top-level directory that has both a `src/` folder (our
 * TypeScript source) and a `typings/` folder (synced down by Screeps: Arena).
 */
export function findArenas() {
  return readdirSync(rootDir)
    .filter((name) => statSync(path.join(rootDir, name)).isDirectory())
    .filter((name) => {
      const dir = path.join(rootDir, name);
      return (
        existsSync(path.join(dir, "src", "main.ts")) &&
        existsSync(path.join(dir, "typings"))
      );
    })
    .map((name) => ({
      name,
      dir: path.join(rootDir, name),
      entry: path.join(rootDir, name, "src", "main.ts"),
      outfile: path.join(rootDir, name, "main.mjs"),
      tsconfig: path.join(rootDir, name, "tsconfig.json"),
    }));
}

export { rootDir };
