import fs from 'fs';
import path from 'path';

const locales = ['en', 'hi', 'ta', 'mr', 'or', 'bn'];
const dicts = {};
for (const l of locales) {
  dicts[l] = JSON.parse(fs.readFileSync(path.join('src/locales', `${l}.json`), 'utf8'));
}

function hasKey(obj, pathStr) {
  const parts = pathStr.split('.');
  let curr = obj;
  for (const p of parts) {
    if (curr === undefined || curr === null || typeof curr !== 'object') return false;
    curr = curr[p];
  }
  return curr !== undefined;
}

const usedKeys = new Map();

function scanDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'locales' && entry.name !== 'assets') scanDir(full);
    } else if (/\.(jsx|js)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const regex = /(?:^|[^\w.])t\(\s*['"]([a-zA-Z0-9_.-]+)['"]\s*(?:,\s*(?:['"]([^'"]*)['"]|\{([^}]*)\}))?\s*\)/g;
      let m;
      while ((m = regex.exec(content)) !== null) {
        const key = m[1];
        const def = m[2] || '';
        if (!usedKeys.has(key)) usedKeys.set(key, []);
        usedKeys.get(key).push({ file: path.relative('src', full), def });
      }
    }
  }
}

scanDir('src');

console.log('Total unique t() keys called in code:', usedKeys.size);

for (const l of locales) {
  const missing = [];
  for (const [k, usages] of usedKeys.entries()) {
    if (!hasKey(dicts[l], k)) {
      missing.push({ key: k, usages });
    }
  }
  console.log(`\n=== Language: ${l.toUpperCase()} is MISSING ${missing.length} keys called in components ===`);
  missing.forEach(m => {
    console.log(`  ${m.key} -> in ${m.usages[0].file} (fallback: "${m.usages[0].def}")`);
  });
}
