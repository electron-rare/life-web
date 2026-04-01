# life-web

FineFab operator cockpit -- product workflows, real-time monitoring, and dashboard UI.

Part of the [FineFab](https://github.com/L-electron-Rare) platform.

## What it does

- Provides a unified web interface for all FineFab services
- Displays real-time monitoring dashboards for manufacturing and AI pipelines
- Manages product workflows and operator actions
- Consumes the `life-reborn` API gateway for all backend operations

## Tech stack

TypeScript / Vite / React 19 / pnpm

## Quick start

```bash
pnpm install
pnpm dev
```

## Project structure

```
src/pages/        # Pages and user flows
src/components/   # Shared UI components
src/api/          # API clients and adapters
```

## Related repos

| Repo | Role |
|------|------|
| [life-reborn](https://github.com/L-electron-Rare/life-reborn) | API gateway (auth, rate limiting, OpenAPI) |
| [life-core](https://github.com/L-electron-Rare/life-core) | AI backend engine |
| [life-spec](https://github.com/L-electron-Rare/life-spec) | Functional specifications and BMAD gates |
| [finefab-shared](https://github.com/L-electron-Rare/finefab-shared) | Shared contracts and types |

## License

[MIT](LICENSE)
