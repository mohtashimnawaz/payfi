// Minimal Payfi type shim to satisfy frontend builds.
// For stronger types, generate/copy `target/types/payfi.ts` into this file.

export type Payfi = any;

/* If you prefer the richer Anchor-generated types, run:
   npm run sync:idl
   and then replace the contents of this file with the generated types
   (they will be copied to `app/frontend/src/types/payfi.ts`). */
