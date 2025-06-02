import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = packageJson.version;

// Update version.ts
const versionTs = `export const VERSION = '${version}';\n`;
fs.writeFileSync(path.join(rootDir, 'src/config/version.ts'), versionTs);

console.log(`Version updated to ${version} across all files!`); 