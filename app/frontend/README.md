# PayFi Frontend (scaffold)

This folder is an intentionally minimal Next.js + TypeScript scaffold placed at `app/frontend`.

Quickstart
1. cd app/frontend
2. yarn install (or npm install)
3. yarn dev

Notes
- This is an empty skeleton (bento layout & wallet integration not implemented yet).
- Add environment variables in Vercel: `ANCHOR_PROVIDER_URL`, `ANCHOR_WALLET`.
- Keep generated IDL and TS types in sync for the frontend: from repo root run `npm run sync:frontend-artifacts` or from `app/frontend` run `npm run sync:idl`.

Next tasks
- Add wallet adapter, Bento UI, pages for Deposit/Withdraw/Admin, and Playwright tests.
