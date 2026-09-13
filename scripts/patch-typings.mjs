// The typings Screeps: Arena syncs down to each arena's `typings/` folder
// have a handful of upstream bugs (missing imports/exports, one file with a
// stray top-level import that breaks its ambient module declaration). These
// patches fix them in place so `tsc` can actually type-check against them.
// Screeps may re-sync fresh typings at any time (overwriting these fixes),
// so this script is idempotent and safe to re-run - it's wired up as a
// "pre" step on both build and typecheck.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findArenas } from "./arenas.mjs";

const patches = [
  {
    file: "game/prototypes/game-object.d.ts",
    apply: (src) =>
      src
        .replace('import {SearchPathOptions} from "../path-finder";\n\n', "")
        // `Position` is a plain object type, not a class - it can't be
        // extended. GameObject already redeclares x/y itself anyway.
        .replace(
          "export class GameObject extends Position {",
          "export class GameObject {",
        ),
  },
  {
    file: "game/prototypes/index.d.ts",
    apply: (src) =>
      src.includes('"game/prototypes/game-object";\n    export {Position}')
        ? src
        : src.replace(
            'export {GameObject} from "game/prototypes/game-object";',
            'export {GameObject} from "game/prototypes/game-object";\n    export {Position} from "game/prototypes/game-object";',
          ),
  },
  {
    file: "game/prototypes/creep.d.ts",
    apply: (src) =>
      src
        .replace(
          "ATTACK, CARRY, HEAL, MOVE, RANGED_ATTACK, WORK",
          "ATTACK, CARRY, HEAL, MOVE, RANGED_ATTACK, TOUGH, WORK",
        )
        .replace(
          'import { Position } from "game/utils";',
          'import { Position } from "game/prototypes/game-object";',
        ),
  },
  {
    file: "game/prototypes/spawn.d.ts",
    apply: (src) => {
      const withImport = src.includes('import { Direction } from "game/utils";')
        ? src
        : src.replace(
            'import { OwnedStructure } from "game/prototypes/owned-structure";',
            'import { OwnedStructure } from "game/prototypes/owned-structure";\n    import { Direction } from "game/utils";',
          );
      return withImport.replaceAll("DirectionConstant[]", "Direction[]");
    },
  },
  {
    file: "game/prototypes/tower.d.ts",
    apply: (src) =>
      src.includes('import { Creep } from "game/prototypes/creep";')
        ? src
        : src.replace(
            'import { Store } from "game/prototypes/store";',
            'import { Store } from "game/prototypes/store";\n    import { Creep } from "game/prototypes/creep";\n    import { Structure } from "game/prototypes/structure";',
          ),
  },
];

export function patchTypings() {
  let changedFiles = 0;

  for (const arena of findArenas()) {
    for (const patch of patches) {
      const filePath = path.join(arena.dir, "typings", patch.file);
      if (!existsSync(filePath)) {
        continue;
      }
      const before = readFileSync(filePath, "utf8");
      const after = patch.apply(before);
      if (after !== before) {
        writeFileSync(filePath, after);
        changedFiles += 1;
      }
    }
  }

  if (changedFiles > 0) {
    console.log(`Patched ${changedFiles} typings file(s).`);
  }

  return { changedFiles };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  patchTypings();
}
