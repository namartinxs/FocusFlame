# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

FocusFlame is a browser extension (Manifest V3) for focus sessions split into
10-minute blocks, inspired by the Yeolpunta app. Each completed block earns the
user a reward. Users create an account so their progress persists across
devices.

Stack: **React + TypeScript + Vite**, packaged as an extension with
**CRXJS** (`@crxjs/vite-plugin`). Accounts and data storage use **Supabase**
(Auth + Postgres).

## Commands

```bash
npm install
npm run dev       # dev build with HMR (CRXJS reloads the extension automatically)
npm run build     # tsc -b (type-check) + vite build -> dist/
npm run lint      # oxlint
npm run preview   # preview a production build
```

There is no test suite yet. `npm run build` is the closest thing to a
correctness check — always run it (not just `tsc` or `vite build` alone)
before considering a change done, since it runs the type-check project
references (`tsconfig.app.json` + `tsconfig.node.json`) first.

To manually verify in a real browser: `npm run build`, then load the `dist/`
folder as an unpacked extension via `chrome://extensions` (Developer mode →
Load unpacked).

## Architecture

- **`manifest.config.ts`** — the MV3 manifest, defined with CRXJS's
  `defineManifest` instead of a static `manifest.json`, so it can pull the
  version from `package.json` and get type-checked. Imported by
  `vite.config.ts` (as `./manifest.config.ts` — the explicit extension is
  required because `tsconfig.node.json` uses `module: nodenext`).
- **`vite.config.ts`** — wires `@vitejs/plugin-react` and `crx({ manifest })`.
  CRXJS reads the manifest, bundles each entry point (popup HTML, background
  service worker) and rewrites `dist/manifest.json` accordingly; it also
  handles MV3-aware HMR during `npm run dev`, which a plain Vite setup can't
  do for extensions.
- **`src/popup/`** — the UI shown when the user clicks the extension icon.
  `main.tsx` mounts `App.tsx`, which:
  - gates on Supabase auth state (`AuthPanel` if there's no session),
  - renders the block timer (`src/lib/timer.ts`'s `useBlockTimer` hook,
    counting down `BLOCK_DURATION_SECONDS` = 600s),
  - renders the block grid (`BlockGrid`) and earned rewards (`RewardsList`).
  Session/reward state currently lives only in React state in `App.tsx` —
  it resets when the popup closes. Persisting sessions/rewards to Supabase
  and keeping the timer alive while the popup is closed (e.g. via
  `chrome.alarms`, driven from `src/background/index.ts`) are the two big
  pieces of unfinished business logic.
- **`src/background/index.ts`** — the MV3 service worker. Currently just logs
  on install; this is where cross-popup-lifetime timer/alarm logic should
  live once implemented.
- **`src/lib/supabase.ts`** — single shared Supabase client, built from
  `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Vite only
  exposes env vars prefixed `VITE_`. Copy `.env.example` to `.env` (gitignored)
  and fill in a project's URL/anon key to run auth locally. No Postgres schema
  exists yet — designing the tables for sessions/blocks/rewards is open work.
- **`src/types/index.ts`** — shared domain types: `FocusBlock` (with
  `status: 'pending' | 'active' | 'completed' | 'skipped'`), `FocusSession`,
  `Reward`.
- **`public/icons/*.png`** — solid-color placeholder icons generated
  programmatically (not real artwork); replace before shipping.

## Conventions

- Path aliases aren't set up — imports between `src/popup`, `src/lib`, and
  `src/types` use relative paths (see existing files for the pattern).
- Keep manifest permissions in `manifest.config.ts` minimal — add new
  `permissions` entries only when a feature actually needs them (currently
  just `storage` and `alarms`, and `alarms` is unused so far — it's there for
  the background-timer work described above).
