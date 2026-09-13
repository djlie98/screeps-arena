// Every arena has its own typings/ folder, synced down independently by the
// game. In practice they're identical for a given engine version, but there's
// no single one of them that's "the" source of truth for code (like common/)
// that isn't tied to one arena. This script builds that source of truth by
// consolidating every arena's typings/ into common/typings/:
//
// - Files that exist under typings/game/ with the *same content* in every
//   arena that has them are copied once to common/typings/game/.
// - If an arena disagrees (different content at the same relative path),
//   that's a real divergence worth knowing about - it's never silently
//   resolved. The majority version (most arenas agree) is written, and every
//   disagreement is printed as a warning naming the arenas and file.
// - Typings outside game/ (e.g. season4-pain_and_gain's arena-specific
//   `season_4/pain_and_gain/...` modules) are arena-specific by nature, not
//   shared - they're copied under common/typings/arena-specific/<arena>/ so
//   they stay available without being mistaken for universal "game" API.
//
// common/typings/ is fully regenerated on every run (stale files from
// removed arenas don't linger) and is gitignored - run this (or `npm run
// build`/`typecheck`, which do it automatically) after adding a new arena or
// whenever the game re-syncs an existing one.
import {
  readdirSync,
  statSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rootDir, findTypingsSources } from "./arenas.mjs";

const OUTPUT_DIR = path.join(rootDir, "common", "typings");

function walkFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkFiles(full));
    } else if (entry.endsWith(".d.ts")) {
      results.push(full);
    }
  }
  return results;
}

/** Picks the content most arenas agree on; returns it plus any dissenters. */
function resolveConflict(copies) {
  const byContent = new Map(); // content -> arena names
  for (const { arena, content } of copies) {
    const list = byContent.get(content) ?? [];
    list.push(arena);
    byContent.set(content, list);
  }
  const ranked = [...byContent.entries()].sort((a, b) => b[1].length - a[1].length);
  const [canonicalContent, agreeingArenas] = ranked[0];
  const dissenting = ranked.slice(1).flatMap(([, arenas]) => arenas);
  return { canonicalContent, agreeingArenas, dissenting };
}

export function consolidateTypings() {
  const sources = findTypingsSources();
  const warnings = [];
  let filesWritten = 0;

  rmSync(OUTPUT_DIR, { recursive: true, force: true });

  if (sources.length === 0) {
    console.log("No arenas with typings/ found - nothing to consolidate.");
    return { arenaCount: 0, filesWritten: 0, warnings };
  }

  // Shared "game/" API: one relative-path -> per-arena content map.
  const gameFiles = new Map(); // relPath -> [{ arena, content }]

  for (const source of sources) {
    const gameDir = path.join(source.typingsDir, "game");
    if (!existsSync(gameDir)) continue;
    for (const file of walkFiles(gameDir)) {
      const relPath = path.relative(source.typingsDir, file); // e.g. game/prototypes/creep.d.ts
      const content = readFileSync(file, "utf8");
      const list = gameFiles.get(relPath) ?? [];
      list.push({ arena: source.name, content });
      gameFiles.set(relPath, list);
    }
  }

  for (const [relPath, copies] of gameFiles) {
    const { canonicalContent, agreeingArenas, dissenting } = resolveConflict(copies);
    if (dissenting.length > 0) {
      warnings.push(
        `${relPath}: ${agreeingArenas.join(", ")} agree; ${dissenting.join(", ")} differ - using the ${agreeingArenas.length}-arena version. Review manually if this is unexpected.`,
      );
    }
    const outPath = path.join(OUTPUT_DIR, relPath);
    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, canonicalContent);
    filesWritten += 1;
  }

  // Arena-specific extras: anything under typings/ that isn't under game/.
  for (const source of sources) {
    const gameDir = path.join(source.typingsDir, "game");
    for (const file of walkFiles(source.typingsDir)) {
      if (file.startsWith(gameDir + path.sep)) continue; // already handled above
      const relPath = path.relative(source.typingsDir, file);
      const outPath = path.join(OUTPUT_DIR, "arena-specific", source.name, relPath);
      mkdirSync(path.dirname(outPath), { recursive: true });
      writeFileSync(outPath, readFileSync(file, "utf8"));
      filesWritten += 1;
    }
  }

  if (warnings.length > 0) {
    console.warn(`consolidate-typings: ${warnings.length} divergence(s) found:`);
    for (const w of warnings) console.warn(`  - ${w}`);
  }
  console.log(
    `Consolidated typings from ${sources.length} arena(s) (${sources.map((s) => s.name).join(", ")}) into common/typings/ (${filesWritten} file(s)).`,
  );

  return { arenaCount: sources.length, filesWritten, warnings };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  consolidateTypings();
}
