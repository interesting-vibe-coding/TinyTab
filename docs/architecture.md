# Architecture

TinyTab separates Chrome API effects from deterministic policy.

```text
content observer ─┐
tabs.lastAccessed ├→ activity store → close decision
settings store ───┘                       ↓
alarm → scanner → fresh tab recheck → tabs.remove → badge
```

## Components

- `src/background/service-worker.ts`: Chrome event wiring and alarm lifecycle.
- `src/background/scanner.ts`: scan orchestration, race-safe tab recheck, close effects.
- `src/background/close-decision.ts`: pure keep/close policy with explicit reason codes.
- `src/content/activity-observer.ts`: coarse activity signals; never reads page content.
- `src/background/settings-store.ts`: validation and migration-safe settings persistence.
- `src/background/activity-store.ts`: session-scoped per-tab activity.
- `src/background/daily-counter.ts`: pure local-day rollover.
- `src/popup` and `src/options`: static framework-free UI.

## Smart Close

A tab becomes eligible after its latest browser access or observed interaction exceeds the configured timeout. Smart Close then protects:

- active or pinned tabs
- audible or loading tabs
- restricted URLs and whitelist matches
- playing media, including silent media observed in the page
- forms that emitted edit events
- pages with recent DOM activity

Before removal, TinyTab fetches fresh tab state to avoid closing a tab activated during a scan.

## Build

esbuild bundles four small TypeScript entry points because Manifest V3 content scripts cannot load ES module imports directly. Static HTML, CSS, manifest, and icons copy unchanged to `dist/`.
