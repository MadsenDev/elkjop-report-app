const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script starting...');

try {
  // Expose protected methods that allow the renderer process to use
  // the ipcRenderer without exposing the entire object
  contextBridge.exposeInMainWorld(
    'electron',
    {
      // Window control methods
      minimize: () => ipcRenderer.send('minimize'),
      maximize: () => ipcRenderer.send('maximize'),
      close: () => ipcRenderer.send('close'),
      
      // Event listeners
      on: (channel, callback) => {
        console.log('Registering listener for channel:', channel);
        const validChannels = ['window-maximize', 'window-unmaximize'];
        if (validChannels.includes(channel)) {
          // Deliberately strip event as it includes `sender` 
          ipcRenderer.on(channel, (event, ...args) => callback(...args));
          return () => {
            console.log('Removing listener for channel:', channel);
            ipcRenderer.removeListener(channel, callback);
          };
        }
        return () => {};
      },
      
      // Clipboard methods
      writeText: (text) => ipcRenderer.invoke('clipboard-write-text', text),
      readText: () => ipcRenderer.invoke('clipboard-read-text'),
      writeImage: (imageData) => ipcRenderer.invoke('clipboard-write-image', imageData),
      readImage: () => ipcRenderer.invoke('clipboard-read-image'),
      
      // Store operations
      getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
      setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value)
    }
  );
  console.log('Preload script completed successfully');
} catch (error) {
  console.error('Error in preload script:', error);
} 