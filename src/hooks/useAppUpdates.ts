import { useState, useEffect, useCallback } from 'react';

interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

interface UpdateStatus {
  type: string;
  message: string;
  data?: any;
}

export function useAppUpdates() {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateStatus, setUpdateStatus] = useState<string>('');

  // Listen for update events from main process
  useEffect(() => {
    if (!window.electron) return;

    const removeListener = window.electron.on('update-status', (status: UpdateStatus) => {
      console.log('Update status received:', status);
      
      switch (status.type) {
        case 'checking-for-update':
          setUpdateStatus('Checking for updates...');
          break;
          
        case 'update-available':
          setUpdateInfo({
            version: status.data?.version || 'Unknown',
            releaseDate: status.data?.releaseDate,
            releaseNotes: status.data?.releaseNotes
          });
          setIsUpdateModalOpen(true);
          setUpdateStatus('Update available');
          break;
          
        case 'update-not-available':
          setUpdateStatus('No updates available');
          break;
          
        case 'download-progress':
          setIsDownloading(true);
          setDownloadProgress(status.data?.percent || 0);
          setUpdateStatus(`Downloading: ${Math.round(status.data?.percent || 0)}%`);
          break;
          
        case 'update-downloaded':
          setIsDownloading(false);
          setDownloadProgress(100);
          setUpdateStatus('Update downloaded and ready to install');
          // Show install dialog or auto-install
          if (window.electron?.installUpdate) {
            window.electron.installUpdate();
          }
          break;
          
        case 'error':
          setUpdateStatus(`Error: ${status.message}`);
          setIsDownloading(false);
          break;
      }
    });

    return removeListener;
  }, []);

  const checkForUpdates = useCallback(async () => {
    if (!window.electron?.checkForUpdates) return;
    
    try {
      setUpdateStatus('Checking for updates...');
      const result = await window.electron.checkForUpdates();
      if (!result.success) {
        setUpdateStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setUpdateStatus(`Error checking for updates: ${error}`);
    }
  }, []);

  const downloadUpdate = useCallback(async () => {
    if (!window.electron?.downloadUpdate) return;
    
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      const result = await window.electron.downloadUpdate();
      if (!result.success) {
        setUpdateStatus(`Error: ${result.error}`);
        setIsDownloading(false);
      }
    } catch (error) {
      setUpdateStatus(`Error downloading update: ${error}`);
      setIsDownloading(false);
    }
  }, []);

  const skipUpdate = useCallback(async () => {
    if (!window.electron?.skipUpdate || !updateInfo) return;
    
    try {
      await window.electron.skipUpdate(updateInfo.version);
      setIsUpdateModalOpen(false);
      setUpdateStatus('Update skipped');
    } catch (error) {
      setUpdateStatus(`Error skipping update: ${error}`);
    }
  }, [updateInfo]);

  const remindLater = useCallback(() => {
    setIsUpdateModalOpen(false);
    setUpdateStatus('Update reminder set for later');
  }, []);

  const closeUpdateModal = useCallback(() => {
    setIsUpdateModalOpen(false);
  }, []);

  return {
    isUpdateModalOpen,
    updateInfo,
    isDownloading,
    downloadProgress,
    updateStatus,
    checkForUpdates,
    downloadUpdate,
    skipUpdate,
    remindLater,
    closeUpdateModal
  };
} 