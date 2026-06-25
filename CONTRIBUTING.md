# Contributing

Keep TinyTab small, predictable, and single-purpose.

```sh
npm ci
npm run verify
```

Requirements:

- Add a failing test before behavior changes.
- Keep Chrome API effects outside pure policy modules.
- Do not add analytics, telemetry, accounts, dashboards, or remote requests.
- Document new permissions and privacy impact.
- Keep exported functions documented with JSDoc.

Open an issue before adding roadmap features or changing default behavior.
