import {
  readTextFile,
  writeTextFile,
  exists,
  mkdir,
  BaseDirectory
} from '@tauri-apps/plugin-fs';

async function ensureDataDirectoryExists() {
  const dataDirPath = 'data';
  const dirExists = await exists(dataDirPath, {
    baseDir: BaseDirectory.AppData
  });

  if (!dirExists) {
    console.log('Creating data directory in AppData');
    await mkdir(dataDirPath, {
      baseDir: BaseDirectory.AppData,
      recursive: true
    });
  }
}

async function ensureDataFileExists(filename: string) {
  await ensureDataDirectoryExists();

  const filePath = `data/${filename}`;
  const fileExists = await exists(filePath, {
    baseDir: BaseDirectory.AppData
  });

  if (!fileExists) {
    console.log(`File ${filename} not found in AppData, copying from public/`);
    try {
      const response = await fetch(`/data/${filename}`);
      const defaultData = await response.text();
      await writeTextFile(filePath, defaultData, {
        baseDir: BaseDirectory.AppData
      });
      console.log(`Successfully copied ${filename} to AppData`);
    } catch (error) {
      console.error(`Error copying ${filename}:`, error);
      throw error;
    }
  }
}

export async function readJsonTauri(filename: string) {
  try {
    await ensureDataFileExists(filename);

    const filePath = `data/${filename}`;
    console.log('Reading file from AppData:', filePath);

    const contents = await readTextFile(filePath, {
      baseDir: BaseDirectory.AppData
    });
    console.log('Successfully read file contents');
    return JSON.parse(contents);
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
}

export async function saveJsonTauri(filename: string, data: any) {
  try {
    await ensureDataDirectoryExists();

    const filePath = `data/${filename}`;
    console.log('Saving file to AppData:', filePath);

    await writeTextFile(filePath, JSON.stringify(data, null, 2), {
      baseDir: BaseDirectory.AppData
    });
    console.log('File saved successfully');
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
}