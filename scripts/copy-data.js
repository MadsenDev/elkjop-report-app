import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source directory (where the JSON files are in development)
const sourceDir = path.join(__dirname, '../public/data');

// Destination directory (where the built app will look for the files)
const destDir = path.join(__dirname, '../dist/data');

// Create the destination directory if it doesn't exist
try {
  await fs.mkdir(destDir, { recursive: true });
} catch (error) {
  console.error('Error creating directory:', error);
}

// Copy each JSON file
const files = ['people.json', 'services.json', 'goals.json'];
for (const file of files) {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(destDir, file);
  
  try {
    await fs.copyFile(sourcePath, destPath);
    console.log(`Copied ${file} to ${destDir}`);
  } catch (error) {
    console.error(`Warning: ${file} not found in ${sourceDir}`);
  }
} 