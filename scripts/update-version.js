import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = packageJson.version;

// Update tauri.conf.json
const tauriConf = JSON.parse(fs.readFileSync(path.join(rootDir, 'src-tauri/tauri.conf.json'), 'utf8'));
tauriConf.version = version;
fs.writeFileSync(
  path.join(rootDir, 'src-tauri/tauri.conf.json'),
  JSON.stringify(tauriConf, null, 2) + '\n'
);

// Update Cargo.toml
const cargoToml = fs.readFileSync(path.join(rootDir, 'src-tauri/Cargo.toml'), 'utf8');
const updatedCargoToml = cargoToml.replace(/version = ".*"/, `version = "${version}"`);
fs.writeFileSync(path.join(rootDir, 'src-tauri/Cargo.toml'), updatedCargoToml);

// Update version.ts
const versionTs = `export const VERSION = '${version}';\n`;
fs.writeFileSync(path.join(rootDir, 'src/config/version.ts'), versionTs);

console.log(`Version updated to ${version} across all files!`); 