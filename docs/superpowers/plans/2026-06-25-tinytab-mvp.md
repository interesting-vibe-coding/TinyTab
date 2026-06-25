# TinyTab MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a production-quality, Atlas-first Manifest V3 extension that closes genuinely idle Chromium tabs with predictable safeguards.

**Architecture:** A small service worker owns alarms, settings, scans, close counts, and badge state. Pure shared modules decide URL eligibility, whitelist matching, idle age, daily rollover, and Smart Close protection; a minimal content script reports coarse activity signals without collecting page content. Popup and options pages use static HTML, CSS, and TypeScript.

**Tech Stack:** TypeScript, Chrome Extensions Manifest V3, Vitest, ESLint, Prettier, GitHub Actions.

---

### Task 1: Project skeleton and contracts

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `src/shared/types.ts`
- Create: `src/shared/defaults.ts`
- Test: `tests/shared/defaults.test.ts`

- [ ] Write failing tests asserting default timeout `30`, Smart Close enabled, active/pinned protection enabled, and empty whitelist.
- [ ] Run `npm test -- tests/shared/defaults.test.ts`; expect failure because modules do not exist.
- [ ] Add strict typed settings/activity contracts and immutable defaults.
- [ ] Re-run targeted test; expect pass.
- [ ] Commit `chore: initialize TinyTab`.

### Task 2: Pure close-decision engine

**Files:**
- Create: `src/shared/url-policy.ts`
- Create: `src/shared/whitelist.ts`
- Create: `src/background/close-decision.ts`
- Test: `tests/shared/url-policy.test.ts`
- Test: `tests/shared/whitelist.test.ts`
- Test: `tests/background/close-decision.test.ts`

- [ ] Write failing tests for restricted schemes, Chrome PDF viewer URLs, exact hosts, wildcard subdomains, localhost/IP entries, boundary-safe host matching, timeout edges, active/pinned/audible/loading tabs, and each Smart Close signal.
- [ ] Run targeted tests; expect missing-module failures.
- [ ] Implement pure normalization, matching, URL classification, and decision functions with explicit reason codes.
- [ ] Re-run targeted tests; expect pass.
- [ ] Commit `feat: add deterministic close policy`.

### Task 3: Storage, badge, and Chrome API boundary

**Files:**
- Create: `src/shared/chrome-api.ts`
- Create: `src/background/settings-store.ts`
- Create: `src/background/activity-store.ts`
- Create: `src/background/daily-counter.ts`
- Create: `src/background/badge.ts`
- Test: `tests/background/daily-counter.test.ts`
- Test: `tests/background/settings-store.test.ts`

- [ ] Write failing tests for settings migration/validation, malformed storage recovery, local-day rollover, count increment, and badge text.
- [ ] Run targeted tests; expect failures.
- [ ] Implement Promise-based Chrome wrappers, storage validation, session activity persistence, and daily counter logic. Catch rejected Chrome calls and log only behind debug flag.
- [ ] Re-run targeted tests; expect pass.
- [ ] Commit `feat: add resilient extension state`.

### Task 4: Smart Close activity observer

**Files:**
- Create: `src/content/activity-observer.ts`
- Create: `src/content/index.ts`
- Create: `src/shared/messages.ts`
- Test: `tests/content/activity-observer.test.ts`

- [ ] Write failing tests for trusted interaction timestamps, media state, dirty-form state without values, same-origin request filtering, throttled reports, and cleanup.
- [ ] Run targeted tests; expect failures.
- [ ] Implement coarse signal collection. Never transmit DOM text, field values, request bodies, headers, or cross-origin URLs.
- [ ] Re-run targeted tests; expect pass.
- [ ] Commit `feat: detect meaningful tab activity`.

### Task 5: Scanner and service worker

**Files:**
- Create: `src/background/scanner.ts`
- Create: `src/background/service-worker.ts`
- Test: `tests/background/scanner.test.ts`

- [ ] Write failing tests for scan ordering, stale/missing activity fallback, globally active download protection, successful close counting, remove failures, alarm restoration, tab lifecycle updates, and pause behavior.
- [ ] Run targeted tests; expect failures.
- [ ] Implement one-minute alarm scan, event listeners, activity initialization, safe tab removal, counter updates, and badge refresh.
- [ ] Re-run targeted tests; expect pass.
- [ ] Commit `feat: close idle tabs safely`.

### Task 6: Popup, options, manifest, and assets

**Files:**
- Create: `public/manifest.json`
- Create: `public/popup.html`
- Create: `public/options.html`
- Create: `src/popup/index.ts`
- Create: `src/options/index.ts`
- Create: `src/ui/base.css`
- Create: `scripts/build.mjs`
- Create: `public/icons/icon-16.png`
- Create: `public/icons/icon-32.png`
- Create: `public/icons/icon-48.png`
- Create: `public/icons/icon-128.png`
- Test: `tests/options/parse-whitelist.test.ts`

- [ ] Write failing tests for whitelist textarea parsing, dedupe, timeout validation, and settings serialization.
- [ ] Run targeted tests; expect failures.
- [ ] Implement compact Kaji-influenced native UI, accessible controls, pause toggle, open-tab/closed-today counts, settings persistence, manifest permissions, and deterministic build copying.
- [ ] Re-run targeted tests; expect pass.
- [ ] Run `npm run build`; inspect `dist/manifest.json` and generated files.
- [ ] Commit `feat: add TinyTab interface`.

### Task 7: OSS release surface

**Files:**
- Create: `README.md`
- Create: `README.zh.md`
- Create: `PRIVACY.md`
- Create: `LICENSE`
- Create: `CONTRIBUTING.md`
- Create: `.github/workflows/ci.yml`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/pull_request_template.md`
- Create: `docs/architecture.md`

- [ ] Document product philosophy, Smart Close guarantees/limits, permissions, Atlas/Chromium installation, development, architecture, privacy, and roadmap without claiming unsupported detection.
- [ ] Add CI for install, format check, lint, typecheck, test, and build.
- [ ] Run `npm run verify`; expect zero failures.
- [ ] Load unpacked `dist/` in Atlas/Chromium and verify popup/options/service worker.
- [ ] Commit `docs: prepare public release`.
- [ ] Request adversarial Claude review against this plan; fix verified critical/important findings with regression tests.
- [ ] Run fresh `npm run verify`, inspect clean git status, create public GitHub repository, push `main`, and configure description/topics.
