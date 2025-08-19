import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo?: UpdateInfo;
  onDownload: () => void;
  onSkip: () => void;
  onRemindLater: () => void;
  isDownloading?: boolean;
  downloadProgress?: number;
}

export default function UpdateModal({
  isOpen,
  onClose,
  updateInfo,
  onDownload,
  onSkip,
  onRemindLater,
  isDownloading = false,
  downloadProgress = 0
}: UpdateModalProps) {
  const [currentVersion, setCurrentVersion] = useState<string>('');

  useEffect(() => {
    // Get current app version from package.json or electron
    if (window.electron) {
      // You could add a method to get the current version from electron
      // For now, we'll use a placeholder
      setCurrentVersion('1.7.7'); // This should come from package.json
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <ArrowDownTrayIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Update Available
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A new version is ready to download
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Version Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Version</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentVersion}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">New Version</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {updateInfo?.version}
                </span>
              </div>
            </div>

            {/* Download Progress */}
            {isDownloading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Downloading...</span>
                  <span className="text-gray-900 dark:text-white">{Math.round(downloadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Release Notes */}
            {updateInfo?.releaseNotes && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  What's New
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {updateInfo.releaseNotes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          {!isDownloading ? (
            <>
              <button
                onClick={onDownload}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Download Update</span>
              </button>
              <button
                onClick={onSkip}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={onRemindLater}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Later
              </button>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span>Downloading update...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 