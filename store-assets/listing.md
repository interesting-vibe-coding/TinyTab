# Chrome Web Store Listing

## Name

TinyTab

## Summary

Automatically close genuinely idle tabs without dashboards, analytics, or bloat.

## Detailed description

TinyTab is a tiny, predictable tab janitor for modern Chromium browsers.

It scans open tabs once per minute and closes pages that have remained idle past your timeout. Smart Close protects active work, pinned tabs, playing media, edited forms, recent page activity, and whitelisted domains.

TinyTab has no account, analytics, advertising, tracking, remote service, or dashboard. All settings and activity signals stay inside the browser.

Features:

- 30-minute default timeout
- Smart Close protection
- Domain whitelist with wildcard support
- Active-tab and pinned-tab protection
- Pause control
- Daily closed-tab badge

## Category

Productivity

## Language

English

## Homepage

https://github.com/interesting-vibe-coding/TinyTab

## Support

https://github.com/interesting-vibe-coding/TinyTab/issues

## Privacy policy

https://github.com/interesting-vibe-coding/TinyTab/blob/main/PRIVACY.md

## Single purpose

Automatically close idle browser tabs while protecting tabs with signs of meaningful activity.

## Permission justifications

### tabs

Inspect tab URL and state, determine whether a tab is eligible, and close eligible idle tabs.

### alarms

Run one periodic tab scan every minute without keeping a persistent background process.

### storage

Store user settings, temporary Smart Close activity signals, and the daily closed-tab count locally.

### Website access

Run a small local content observer on HTTP and HTTPS pages to detect coarse interaction, media, edited-form, and recent same-origin resource-activity signals. TinyTab does not read page text or form values and sends no data off-device.

## Data disclosure

No user data is collected or transmitted. TinyTab processes tab URLs, tab state, coarse timestamps, and boolean activity signals locally only.

## Distribution

Public. All regions.
