#!/usr/bin/env node
/**
 * Copy generated Anchor IDL JSON files and generated TS types into the frontend
 * so the frontend is deployable without depending on the workspace `target/` folder.
 *
 * Usage (from repo root):
 *   node scripts/sync-frontend-artifacts.js
 */
const fs = require('fs').promises;
const path = require('path');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyDirFiles(srcDir, destDir, filter) {
  try {
    const files = await fs.readdir(srcDir);
    const filtered = files.filter(filter);
    await ensureDir(destDir);
    for (const f of filtered) {
      const src = path.join(srcDir, f);
      const dest = path.join(destDir, f);
      await fs.copyFile(src, dest);
      console.log(`copied ${src} -> ${dest}`);
    }
    return filtered.length;
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`source directory not found: ${srcDir}`);
      return 0;
    }
    throw err;
  }
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const targetIdlDir = path.join(repoRoot, 'target', 'idl');
  const targetTypesDir = path.join(repoRoot, 'target', 'types');
  const frontendIdlDir = path.join(repoRoot, 'app', 'frontend', 'src', 'idl');
  const frontendTypesDir = path.join(repoRoot, 'app', 'frontend', 'src', 'types');

  console.log('Syncing IDL and generated types into frontend...');

  const idlCount = await copyDirFiles(targetIdlDir, frontendIdlDir, (f) => f.endsWith('.json'));
  const typesCount = await copyDirFiles(targetTypesDir, frontendTypesDir, (f) => f.endsWith('.ts'));

  console.log(`done — copied ${idlCount} IDL(s), ${typesCount} type file(s)`);
  if (idlCount === 0 && typesCount === 0) {
    console.warn('No files copied — ensure you have run `anchor build` or `cargo build-bpf` to generate artifacts in target/');
  }
}

main().catch((err) => {
  console.error('sync failed:', err);
  process.exitCode = 1;
});
