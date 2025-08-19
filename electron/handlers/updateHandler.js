const { autoUpdater } = require('electron-updater');
const { ipcMain, dialog } = require('electron');

class UpdateHandler {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.setupAutoUpdater();
    this.setupIpcHandlers();
  }

  setupAutoUpdater() {
    // Configure auto updater
    autoUpdater.autoDownload = false; // Don't auto-download, let user choose
    autoUpdater.autoInstallOnAppQuit = true; // Install on app quit if downloaded

    // Check for updates on startup
    autoUpdater.checkForUpdates();

    // Event listeners
    autoUpdater.on('checking-for-update', () => {
      this.sendStatusToWindow('checking-for-update', 'Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      this.sendStatusToWindow('update-available', 'Update available', info);
      this.showUpdateAvailableDialog(info);
    });

    autoUpdater.on('update-not-available', (info) => {
      this.sendStatusToWindow('update-not-available', 'Update not available', info);
    });

    autoUpdater.on('error', (err) => {
      this.sendStatusToWindow('error', 'Error in auto-updater', err.message);
      console.error('Auto updater error:', err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      this.sendStatusToWindow('download-progress', 'Downloading update...', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.sendStatusToWindow('update-downloaded', 'Update downloaded', info);
      this.showUpdateReadyDialog(info);
    });
  }

  setupIpcHandlers() {
    // Handle manual update check from renderer
    ipcMain.handle('check-for-updates', async () => {
      try {
        const result = await autoUpdater.checkForUpdates();
        return { success: true, result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Handle download update request
    ipcMain.handle('download-update', async () => {
      try {
        await autoUpdater.downloadUpdate();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Handle install update request
    ipcMain.handle('install-update', () => {
      autoUpdater.quitAndInstall();
    });

    // Handle skip update request
    ipcMain.handle('skip-update', (_, version) => {
      // Store the skipped version to avoid showing it again
      const Store = require('electron-store');
      const store = new Store();
      store.set('skippedUpdate', version);
    });
  }

  sendStatusToWindow(type, message, data = null) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('update-status', { type, message, data });
    }
  }

  async showUpdateAvailableDialog(info) {
    const Store = require('electron-store');
    const store = new Store();
    const skippedVersion = store.get('skippedUpdate');

    // Don't show dialog if user already skipped this version
    if (skippedVersion === info.version) {
      return;
    }

    const result = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available!`,
      detail: `Current version: ${require('electron').app.getVersion()}\nNew version: ${info.version}\n\nWould you like to download and install the update?`,
      buttons: ['Download Update', 'Skip This Version', 'Remind Me Later'],
      defaultId: 0,
      cancelId: 2
    });

    switch (result.response) {
      case 0: // Download Update
        autoUpdater.downloadUpdate();
        break;
      case 1: // Skip This Version
        store.set('skippedUpdate', info.version);
        break;
      case 2: // Remind Me Later
        // Do nothing, will check again next time
        break;
    }
  }

  async showUpdateReadyDialog(info) {
    const result = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded successfully!',
      detail: `Version ${info.version} has been downloaded and is ready to install.\n\nThe app will restart to install the update.`,
      buttons: ['Restart Now', 'Restart Later'],
      defaultId: 0
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  }

  // Method to manually check for updates (can be called from menu or settings)
  async checkForUpdates() {
    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }
}

module.exports = UpdateHandler; 