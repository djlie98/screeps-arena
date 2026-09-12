# Screeps: Arena, in TypeScript

A TypeScript workspace for [Screeps: Arena](https://store.steampowered.com/app/1137320/Screeps_Arena/) bots, built on top of the typings/config that the game itself syncs down per arena.

## Why this exists

Screeps: Arena's official typings and its "Sync to local folder" feature only give you plain JS (`main.mjs` + JSDoc-style `.d.ts` typings). Community TypeScript starters (e.g. `screepers/screeps-arena-typescript-starter`) predate Season 3/4 and target the old `arena_*` folder layout from the closed alpha, so they don't match how the game organizes arenas today. This repo instead builds TypeScript tooling **around** the existing, game-synced folders rather than replacing them.

## Layout

Each arena is a top-level folder (as created by the game's own sync feature):

```
<arena-name>/
  src/main.ts       <- you write TypeScript here (added by this setup)
  main.mjs          <- build output; this is what the game reads (generated, do not edit)
  typings/          <- synced by the game, do not edit by hand
  jsconfig.json      <- used by the game client itself, left as-is
  tsconfig.json     <- added by this setup, used by our own build/typecheck
```

Root-level tooling:

```
package.json
tsconfig.base.json        <- shared strict compiler options
types/globals.d.ts        <- ambient `console` declaration (not shipped by the game's typings)
scripts/
  arenas.mjs             <- discovers arenas (any folder with src/main.ts + typings/)
  patch-typings.mjs      <- fixes a handful of bugs in the game's generated .d.ts files (see below)
  build.mjs              <- esbuild: bundles each arena's src/main.ts -> <arena>/main.mjs
  typecheck.mjs          <- runs `tsc --noEmit` per arena
  new-arena.mjs          <- scaffolds a new arena's src/main.ts + tsconfig.json
```

## Setup

```
npm install
```

## Workflow

- `npm run build` - bundle every arena's `src/main.ts` into its `main.mjs`.
- `npm run watch` - same, but rebuilds on save (leave running while you work; point the game's local-folder sync at the arena folder as usual and it'll pick up the rebuilt `main.mjs`).
- `npm run typecheck` - type-check every arena with `tsc --noEmit`, no output files.
- `npm run new-arena -- <folder-name>` - scaffold a new arena (e.g. for a season/arena that isn't in this repo yet). After that, open the arena in the Screeps client and enable local-folder sync pointed at the new folder so it can populate `typings/`.

Each arena is bundled independently and imports from `"game/*"` (and `"arena/*"`) are kept external - they're resolved by the Arena runtime itself, not bundled. You can freely split an arena's logic across multiple files under its `src/` folder; esbuild will bundle them together into the one `main.mjs` the game expects.

`main.mjs` files stay committed since the game's local sync reads directly from that exact path - just remember to run `npm run build` (or keep `npm run watch` running) after editing a `src/main.ts`, so the committed `main.mjs` reflects your latest TypeScript.

## About `scripts/patch-typings.mjs`

The `.d.ts` files Screeps: Arena generates under each arena's `typings/` folder have a few real bugs (missing imports/exports, one file with a stray top-level import that breaks its own ambient module declaration) that only go unnoticed because the game's own tooling never fully type-checks them. Left alone, these bugs break inheritance for core types like `Creep`/`GameObject` (e.g. `.exists`, `.getRangeTo()` "not existing" on `Creep`).

`patch-typings.mjs` fixes them in place, and is idempotent (safe to run repeatedly, a no-op once already applied). It runs automatically before `build` and `typecheck` (`prebuild`/`pretypecheck`/`prewatch` npm hooks), so if the game re-syncs fresh typings and reintroduces the bugs, they're fixed again on your next build.

## Adding a new arena to an existing folder

If you've already got a game-synced folder (with `typings/` and `jsconfig.json`) but no `src/`:

```
mkdir <arena-name>/src
```

then add a `tsconfig.json` next to it (copy an existing arena's) and a `src/main.ts` with at least:

```ts
export function loop(): void {
  // ...
}
```

`npm run build` will pick it up automatically.
