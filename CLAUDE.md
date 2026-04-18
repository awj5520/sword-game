# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

검 강화 RPG (Sword Enhancement RPG) — a browser-based Korean-language idle/RPG game built as a static site. No build system, no package manager, no tests. Pure HTML + CSS + vanilla JavaScript, loaded via `<script>` tags in each page. State is persisted entirely in `localStorage`.

## Running / Developing

- Open `index.html` directly in a browser, or serve the folder with any static server (e.g. `python -m http.server`). There is no build step.
- To reset game state during testing, clear the site's `localStorage` in DevTools.
- All UI/game text is in Korean — preserve Korean strings when editing; do not translate them unless asked.

## Architecture

The game is a multi-page app: each `.html` file at the root is a separate screen (enhance/home `index.html`, `hunt.html`, `stage.html`, `shop.html`, `inventory.html`, `stats.html`, `achievement.html`, `monster-codex.html`). Pages share state by all reading/writing the same `localStorage` keys, not through a SPA router.

### Shared state (the single source of truth)

- **`js/gamedata.js`** — defines the global `GameData` object. This is the canonical model: enhancement level, damage, gold, HP, equipped items, inventory counts, battle statistics, etc. Every page loads `gamedata.js` first. Mutations go through `GameData` and are persisted via its save methods to `localStorage`. Constants like `FATE_SUCCESS_RATE_BONUS` and `DEFAULT_BATTLE_STATS` also live here.
- **`js/core.js`** — legacy/minimal `GameData` stub (level, damage, upgrade, save). `gamedata.js` supersedes it; `core.js` is not used by the main pages. Prefer `gamedata.js`.
- **`js/item-defs.js`** — static item/equipment definitions used across shop, inventory, drops.
- **`js/drop-tables.js`** — monster drop configuration consumed by `stage.js`.

### Per-screen controllers

Each page's `<script>` tag loads `gamedata.js` + `item-defs.js` + the screen's own JS (`enhance.js`, `stage.js`, `inventory.js`, `shop.js`, `stats.js`, `achievement.js` / `achievement_ui.js`, `monster-codex.js`). `stage.js` is the largest file (~1400 lines) and contains the entire combat loop, status effects, monster damage tables keyed by `"world:area:stage"`, and loot handling.

`hunt.html` holds the world/area/monster catalog inline in its `<script>` — this is the map definition. Selecting a monster navigates to `stage.html?world=X&area=Y&stage=Z`, and `stage.js` reads those query params to drive the fight.

### Gating and progression

World unlocks are hard-coded level gates enforced in two places: the `goWorld()` handler in `index.html` AND defensively at the top of `hunt.html` (2세계 requires level ≥ 300, 3세계 requires ≥ 700). Keep both in sync if changing thresholds.

### CSS

One stylesheet per screen in `css/` plus `css/base.css` shared by all pages and `css/effects.css` for enhancement animations.

## Conventions

- Korean comments and identifiers are common (e.g. section headers like `/* ❤️ 플레이어 HP */`). Match the surrounding style.
- No module system — everything is global. New shared helpers go in `gamedata.js` or a new `js/*.js` file that gets included via `<script>` in each page that needs it.
- `js/hunt.js` and `js/sound.js` currently exist but are empty placeholders.
- The `gjy'` directory (with unrelated `jjj.c`) and `js/awj.code-workspace` are unrelated to the game and can be ignored.
