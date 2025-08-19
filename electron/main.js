const { app, BrowserWindow, ipcMain, protocol, clipboard, nativeImage, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const { generatePDF } = require('./handlers/pdfHandler');
const UpdateHandler = require('./handlers/updateHandler');

const store = new Store();
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let updateHandler;

// Ensure Windows uses the correct identity for taskbar grouping and pinned icons
// Must match build.appId in package.json
app.setAppUserModelId('dev.madsens.elkjopreportapp');

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload script path:', preloadPath);
  console.log('Preload script exists:', require('fs').existsSync(preloadPath));

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false
    },
    frame: false,
    titleBarStyle: 'hidden',
    icon: process.platform === 'win32'
      ? path.join(__dirname, 'icons/icon.ico')
      : path.join(__dirname, 'icons/icon.png'),
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

  // Initialize update handler (only in production)
  if (!isDev) {
    updateHandler = new UpdateHandler(mainWindow);
  }

  // Handle window controls
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('window-close', () => {
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

  // Handle clipboard operations
  ipcMain.handle('clipboard-write-text', async (_, text) => {
    const { clipboard } = require('electron');
    clipboard.writeText(text);
  });

  ipcMain.handle('clipboard-read-text', async () => {
    const { clipboard } = require('electron');
    return clipboard.readText();
  });

  ipcMain.handle('clipboard-write-image', async (_, imageData) => {
    const { clipboard } = require('electron');
    const nativeImage = require('electron').nativeImage;
    const image = nativeImage.createFromDataURL(imageData);
    clipboard.writeImage(image);
  });

  ipcMain.handle('clipboard-read-image', async () => {
    const { clipboard } = require('electron');
    const image = clipboard.readImage();
    return image.toDataURL();
  });

  // Handle store operations
  ipcMain.handle('get-store-value', async (_, key) => {
    const Store = require('electron-store');
    const store = new Store();
    return store.get(key);
  });

  ipcMain.handle('set-store-value', async (_, key, value) => {
    const Store = require('electron-store');
    const store = new Store();
    store.set(key, value);
  });

  // Handle PDF generation
  ipcMain.handle('generate-pdf', async (_, data) => {
    console.log('Received PDF generation request:', data);
    try {
      const result = await generatePDF(data);
      console.log('PDF generation completed:', result);
      return result;
    } catch (error) {
      console.error('Error in PDF generation:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate PDF'
      };
    }
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

ipcMain.handle('get-changelog', async () => {
  try {
    const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
    return fs.readFileSync(changelogPath, 'utf-8');
  } catch (err) {
    return '# Changelog\nUnable to load changelog.';
  }
}); 