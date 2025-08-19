import React, { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import elkjopLogo from '../assets/elkjop_logo.png';
import { VERSION } from '../config/version';
import { useAppUpdates } from '../hooks/useAppUpdates';

export default function SettingsAboutTab() {
  const [isChecking, setIsChecking] = useState(false);
  const { checkForUpdates, updateStatus } = useAppUpdates();

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    try {
      await checkForUpdates();
    } finally {
      // Keep the loading state for a bit to show feedback
      setTimeout(() => setIsChecking(false), 1000);
    }
  };

  return (
    <div className="relative">
      {/* Main Content */}
      <div className="relative">
        {/* Header with Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-elkjop-green/20 to-blue-500/20 rounded-lg blur-sm" />
            <img 
              src={elkjopLogo} 
              alt="Elkjøp logo" 
              className="relative w-10 h-10 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              Elkjøp Report App
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 font-medium">v{VERSION}</span>
              <span>Personal Project</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckForUpdates}
              disabled={isChecking}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Check for Updates'}
            </button>
            <a 
              href="mailto:chris@madsens.dev" 
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-elkjop-green bg-elkjop-green/5 hover:bg-elkjop-green/10 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </a>
          </div>
        </div>

        {/* Update Status */}
        {updateStatus && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">{updateStatus}</p>
          </div>
        )}

        {/* Description */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            A specialized tool designed for the aftersales operations team to generate daily and weekly reports. 
            Streamlining your workflow with an intuitive interface for tracking service sales, repair tickets, 
            precalibrated TVs, and insurance agreements.
          </p>
        </div>

        {/* Quick Start Guide */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Start Guide</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-elkjop-green/10 text-elkjop-green text-xs font-medium">1</span>
              <span>Configure your team members and services in the People and Services tabs</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-elkjop-green/10 text-elkjop-green text-xs font-medium">2</span>
              <span>Set your daily goals in the Goals tab</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-elkjop-green/10 text-elkjop-green text-xs font-medium">3</span>
              <span>Use the Display settings to customize which sections you want to see</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-elkjop-green/10 text-elkjop-green text-xs font-medium">4</span>
              <span>Export your data regularly using the Data tab's export feature</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">Ctrl/Cmd + L</kbd>
              <span>Toggle Loading Screen</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">Ctrl/Cmd + S</kbd>
              <span>Save Changes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">Ctrl/Cmd + E</kbd>
              <span>Export Data</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">Ctrl/Cmd + I</kbd>
              <span>Import Data</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          {/* Report Generation */}
          <div className="group">
            <div className="relative p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-elkjop-green/50 dark:hover:border-elkjop-green/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 p-2 rounded-md bg-gradient-to-br from-elkjop-green/10 to-blue-500/10">
                  <svg className="w-4 h-4 text-elkjop-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Report Generation</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {['Daily reports', 'Weekly summaries', 'Image export'].map((feature) => (
                      <span key={feature} className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-3 h-3 mr-1 text-elkjop-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="group">
            <div className="relative p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-elkjop-green/50 dark:hover:border-elkjop-green/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 p-2 rounded-md bg-gradient-to-br from-elkjop-green/10 to-blue-500/10">
                  <svg className="w-4 h-4 text-elkjop-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Data Management</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {['Service tracking', 'Repair tickets', 'Insurance tracking'].map((feature) => (
                      <span key={feature} className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-3 h-3 mr-1 text-elkjop-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Stack */}
          <div className="group">
            <div className="relative p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-elkjop-green/50 dark:hover:border-elkjop-green/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 p-2 rounded-md bg-gradient-to-br from-elkjop-green/10 to-blue-500/10">
                  <svg className="w-4 h-4 text-elkjop-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Technical Stack</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {['React + TypeScript', 'Electron', 'Tailwind CSS'].map((tech) => (
                      <span key={tech} className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-3 h-3 mr-1 text-elkjop-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="group">
            <div className="relative p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-elkjop-green/50 dark:hover:border-elkjop-green/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 p-2 rounded-md bg-gradient-to-br from-elkjop-green/10 to-blue-500/10">
                  <svg className="w-4 h-4 text-elkjop-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Statistics</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {['98.5% TypeScript', 'Personal Project', 'All Rights Reserved'].map((stat) => (
                      <span key={stat} className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-3 h-3 mr-1 text-elkjop-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {stat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Created by Christoffer Madsen</span>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/MadsenDev/elkjop-report-app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-elkjop-green transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a 
                href="https://github.com/MadsenDev/elkjop-report-app/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-elkjop-green transition-colors"
              >
                License
              </a>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 