# TinyTab Privacy Policy

Last updated: June 25, 2026.

TinyTab processes browser state locally to decide whether a tab is idle. It does not collect, transmit, sell, or share personal data.

## Data processed locally

- Tab URL, active state, pinned state, loading state, audible state, and Chromium `lastAccessed` timestamp.
- Coarse timestamps for user interaction and page changes.
- Boolean media-playing and edited-form signals.
- User settings, whitelist entries, and daily closed-tab count.

TinyTab does not read or store page text, form values, keystrokes, request bodies, headers, cookies, passwords, or payment information.

## Storage

Settings and daily count use `chrome.storage.local`. Temporary activity signals use `chrome.storage.session` and disappear when the browser session ends.

## Network

TinyTab makes no remote network requests. It contains no analytics, advertising, tracking, telemetry, accounts, or cloud service.

## Permissions

- `tabs`: inspect tab state and close eligible tabs.
- `alarms`: run one periodic scan.
- `storage`: store settings, temporary activity, and daily count.
- Website access: run a small content observer on HTTP and HTTPS pages for Smart Close signals.

## Contact

Open an issue at <https://github.com/interesting-vibe-coding/TinyTab/issues>.
