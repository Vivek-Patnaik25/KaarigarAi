import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'src');
const localesDir = path.join(root, 'locales');
const REQUIRED_LANGUAGES = ['en', 'hi', 'ta', 'mr', 'or', 'bn'];

const dictionaries = {};
const failures = [];

// 1. Check all required locales exist
for (const lang of REQUIRED_LANGUAGES) {
  const fileName = `${lang}.json`;
  const filePath = path.join(localesDir, fileName);
  if (!fs.existsSync(filePath)) {
    failures.push(`Missing required locale file: ${fileName}`);
  } else {
    try {
      dictionaries[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      failures.push(`Malformed JSON in locale file ${fileName}: ${e.message}`);
    }
  }
}

// 2. Check key parity between en and all other languages
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    keys.push(fullKey);
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys = keys.concat(getAllKeys(v, fullKey));
    }
  }
  return keys;
}

function getValueByPath(obj, pathStr) {
  if (!obj) return undefined;
  if (obj[pathStr] !== undefined) return obj[pathStr];
  const parts = pathStr.split('.');
  let curr = obj;
  for (const p of parts) {
    if (curr === undefined || curr === null || typeof curr !== 'object') return undefined;
    curr = curr[p];
  }
  return curr;
}

if (dictionaries['en']) {
  const enKeys = getAllKeys(dictionaries['en']);

  for (const lang of REQUIRED_LANGUAGES) {
    if (lang === 'en' || !dictionaries[lang]) continue;
    const dict = dictionaries[lang];

    for (const key of enKeys) {
      const val = getValueByPath(dict, key);
      if (val === undefined || val === null) {
        failures.push(`[${lang}.json] Missing key: "${key}"`);
      } else if (typeof val === 'string' && val.trim() === '') {
        failures.push(`[${lang}.json] Empty translation for key: "${key}"`);
      }
    }
  }
}

// 3. Scan all JSX/JS files for explicit t('key') and i18n.t('key') calls
const tKeyRegex = /(?:\bi18n\.t|\bt)\(\s*['"`]([a-zA-Z0-9_.]+)['"`]/g;
const calledKeys = new Set();

function scanDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(full);
    } else if (/\.(jsx|js|tsx|ts)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      let match;
      while ((match = tKeyRegex.exec(content)) !== null) {
        calledKeys.add(match[1]);
      }
    }
  }
}
scanDir(root);

for (const key of calledKeys) {
  for (const lang of REQUIRED_LANGUAGES) {
    if (!dictionaries[lang]) continue;
    const val = getValueByPath(dictionaries[lang], key);
    if (val === undefined || val === null) {
      failures.push(`[${lang}.json] Key "${key}" is invoked in JSX code but missing in locale dictionary.`);
    }
  }
}

// 4. Report results
if (failures.length > 0) {
  console.error(`\n❌ Language Audit FAILED with ${failures.length} errors:\n`);
  console.error(failures.slice(0, 50).join('\n'));
  if (failures.length > 50) {
    console.error(`... and ${failures.length - 50} more errors`);
  }
  process.exit(1);
} else {
  console.log(`\n✅ Language Audit PASSED:`);
  console.log(`- ${REQUIRED_LANGUAGES.length} canonical locales verified (${REQUIRED_LANGUAGES.join(', ')})`);
  console.log(`- ${calledKeys.size} unique i18n keys scanned across JSX/TSX components`);
  console.log(`- 100% dictionary completeness, zero empty translations, zero missing keys.`);
}
