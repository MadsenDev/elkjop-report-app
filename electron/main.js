const { app, BrowserWindow, ipcMain, protocol, clipboard, nativeImage, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const puppeteer = require('puppeteer-core');
const { generatePDF } = require('./handlers/pdfHandler');

const store = new Store();
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload script path:', preloadPath);
  console.log('Preload script exists:', require('fs').existsSync(preloadPath));

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: preloadPath,
      webSecurity: true
    },
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, 'icons/icon.png'),
    backgroundColor: '#ffffff'
  });

  // Enable better font rendering
  mainWindow.webContents.setZoomFactor(1);

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Handle window controls
  ipcMain.on('minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.on('maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('close', () => {
    mainWindow.close();
  });

  // Handle window state changes
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximize');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximize');
  });

  // Log when the window is ready
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window loaded successfully');
  });

  // Log any errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Log preload script errors
  mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
    console.error('Preload script error:', preloadPath, error);
  });
}

// Create window when app is ready
app.whenReady().then(() => {
  // Register protocol for serving static files
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.substr(6);
    callback({ path: path.normalize(`${__dirname}/../public/${url}`) });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Store management
ipcMain.handle('get-store-value', (_, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (_, key, value) => {
  store.set(key, value);
  return true;
});

// Clipboard handlers
ipcMain.handle('clipboard-write-text', (_, text) => {
  clipboard.writeText(text);
  return true;
});

ipcMain.handle('clipboard-read-text', () => {
  return clipboard.readText();
});

ipcMain.handle('clipboard-write-image', (_, imageData) => {
  const image = nativeImage.createFromDataURL(imageData);
  clipboard.writeImage(image);
  return true;
});

ipcMain.handle('clipboard-read-image', () => {
  const image = clipboard.readImage();
  return image.isEmpty() ? null : image.toDataURL();
});

// Handle PDF generation
ipcMain.handle('generate-pdf', async (event, data) => {
  return generatePDF(data);
});

ipcMain.handle('get-changelog', async () => {
  try {
    const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
    return fs.readFileSync(changelogPath, 'utf-8');
  } catch (err) {
    return '# Changelog\nUnable to load changelog.';
  }
}); 