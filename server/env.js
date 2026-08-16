import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Loads .env before anything else reads process.env. Imported first by db.js,
 * so DATA_DIR is available when the database path is resolved.
 *
 * Real environment variables always win — hosts like Render inject theirs
 * directly and there is no .env file in the deployed image.
 */
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, '.env');

if (fs.existsSync(file)) {
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

export { ROOT };
