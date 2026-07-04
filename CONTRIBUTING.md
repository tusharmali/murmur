# Contributing to Murmur

Thanks for your interest! Murmur is a small, deliberately-hackable codebase —
contributions of all sizes are welcome.

## Getting started

```bash
git clone https://github.com/tusharmali/murmur.git
cd murmur
npm install
cp .env.example .env    # optional: paste your master Web App URL to skip the setup screen
npm run dev             # http://localhost:3000
```

You'll need to deploy the two Apps Scripts to test end-to-end — see the
[README](README.md#setup) for the master + per-user setup.

## Project layout

| Path | What lives here |
| --- | --- |
| `src/app` | Next.js app-router entry, layout, global styles |
| `src/components` | UI (auth, sidebar, composer, message list, modals) |
| `src/lib` | The core: `crypto.ts`, `db.ts` (IndexedDB), `store.ts` (Zustand), `masterApi.ts` / `userApi.ts` |
| `apps-script/master.gs` | Auth + shared-channel directory (operator deploys once) |
| `apps-script/user.gs` | Each user's private message store |

## Before you open a PR

- `npm run build` and `npm run lint` should pass.
- Keep changes focused; match the surrounding code style (TypeScript, no new
  heavy dependencies unless clearly justified).
- **Data model / crypto changes:** `src/lib/types.ts` and the Apps Scripts are
  intentionally small and additive. Prefer adding fields over breaking existing
  rows. If you touch `crypto.ts` or the auth flow, explain the security reasoning
  in the PR description.
- Update the README/docs if behavior changes.

## Security issues

Do **not** file them as public issues — see [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the
project's [Apache License 2.0](LICENSE).
