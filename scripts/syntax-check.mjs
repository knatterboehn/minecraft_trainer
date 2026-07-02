import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['src', 'scripts', 'tools'];
const files = [];

function collect(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) collect(path);
    if (stat.isFile() && path.endsWith('.js') || stat.isFile() && path.endsWith('.mjs')) files.push(path);
  }
}

roots.forEach(collect);

for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'pipe', encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error(`Syntax check failed: ${file}`);
  }
}

console.log(`Syntax check passed: ${files.length} JavaScript files.`);
