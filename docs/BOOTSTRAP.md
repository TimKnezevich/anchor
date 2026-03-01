# Local Bootstrap

## Commands
1. `npm run test`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run db:migrate`
5. `npm run db:seed`
6. `npm run extension:package`
7. `npm run runtime:start:local`

## Notes
- Current scripts are dependency-free and run on Node.js.
- As the project adopts TypeScript and ESLint, replace script internals without changing command names.
- Storage adapter selection:
  - `AXIS_STORAGE_ADAPTER=memory` (default)
  - `AXIS_STORAGE_ADAPTER=sqlite` (requires SQLite driver wiring)
- Optional SQLite path:
  - `AXIS_SQLITE_PATH=/path/to/axis-dev.sqlite`
- Optional sidecar flags:
  - `AXIS_ENABLE_VECTOR_SIDECAR=true|false` (default `false`)
  - `AXIS_ENABLE_EVENT_SIDECAR=true|false` (default `false`)
- Runtime operations profile guide:
  - `docs/RUNTIME-OPS.md`
