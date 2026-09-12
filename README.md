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
  add-arena.mjs          <- adds src/main.ts + tsconfig.json to a game-synced arena folder
```

## Setup

```
npm install
```

## Workflow

- `npm run build` - bundle every arena's `src/main.ts` into its `main.mjs`.
- `npm run watch` - same, but rebuilds on save (leave running while you work; point the game's local-folder sync at the arena folder as usual and it'll pick up the rebuilt `main.mjs`).
- `npm run typecheck` - type-check every arena with `tsc --noEmit`, no output files.
- `npm run add-arena -- <folder-name>` - add TypeScript support to an arena the game has already created (see below).

Each arena is bundled independently and imports from `"game/*"` (and `"arena/*"`) are kept external - they're resolved by the Arena runtime itself, not bundled. You can freely split an arena's logic across multiple files under its `src/` folder; esbuild will bundle them together into the one `main.mjs` the game expects.

`main.mjs` files stay committed since the game's local sync reads directly from that exact path - just remember to run `npm run build` (or keep `npm run watch` running) after editing a `src/main.ts`, so the committed `main.mjs` reflects your latest TypeScript.

## About `scripts/patch-typings.mjs`

The `.d.ts` files Screeps: Arena generates under each arena's `typings/` folder have a few real bugs (missing imports/exports, one file with a stray top-level import that breaks its own ambient module declaration) that only go unnoticed because the game's own tooling never fully type-checks them. Left alone, these bugs break inheritance for core types like `Creep`/`GameObject` (e.g. `.exists`, `.getRangeTo()` "not existing" on `Creep`).

`patch-typings.mjs` fixes them in place, and is idempotent (safe to run repeatedly, a no-op once already applied). It runs automatically before `build` and `typecheck` (`prebuild`/`pretypecheck`/`prewatch` npm hooks), so if the game re-syncs fresh typings and reintroduces the bugs, they're fixed again on your next build.

## Adding a new arena (e.g. a new season)

Screeps: Arena itself creates the arena's folder - not this repo. When you open a new arena/season in the client and enable **"Sync to local folder"** pointed at a new folder (e.g. `season5-whatever/`), the game writes `typings/`, `jsconfig.json`, and a stub `main.mjs` into it.

Once that folder exists, run:

```
npm run add-arena -- season5-whatever
```

This adds `src/main.ts` (seeded from the `main.mjs` the game just wrote - typically just the empty stub) and a `tsconfig.json`, so `npm run build`/`watch`/`typecheck` pick it up automatically. It's a no-op if `src/main.ts` already exists, so it's safe to run again.

## Playing / testing your bot

1. `npm run watch` (leave it running while you code) - or `npm run build` once before you play.
2. In the Screeps: Arena client, make sure the arena you're working on has **"Sync to local folder"** enabled and pointed at that arena's folder in this repo (this is what made `typings/`/`jsconfig.json` appear in the first place). The client reads `main.mjs` directly from disk, so it'll pick up whatever `esbuild` just produced from your `src/main.ts`.
3. Edit `src/main.ts`, save - `npm run watch` rebuilds `main.mjs` in milliseconds.
4. Back in the client, run/launch the arena as usual (practice match, sandbox run against the AI, etc.) - it uses the current `main.mjs` on disk, not an in-browser editor buffer.
5. When you're happy with a version, commit it (`git add`/`git commit`) - `main.mjs` is a generated file but it's what the game actually ran, so it's worth having in history alongside the `src/main.ts` that produced it.

If an arena has a separate ranked/tournament submission step in the client (as opposed to just running practice matches), that's a click in the Screeps UI itself once you're synced up - this repo only handles getting your TypeScript into the `main.mjs` the client reads, not the in-game submission flow.
