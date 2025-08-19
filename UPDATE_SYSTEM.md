# Auto-Update System for Elkjøp Report App

This document explains how the auto-update system works in the Electron version of the Elkjøp Report App.

## Overview

The app now includes a complete auto-update system that allows users to:
- Automatically check for updates on startup
- Manually check for updates from the settings
- Download and install updates seamlessly
- Skip updates or be reminded later

## How It Works

### 1. Update Detection
- The app checks for updates automatically when it starts (in production builds)
- Users can manually check for updates from Settings → About tab
- Updates are checked against GitHub releases

### 2. Update Process
1. **Check for Updates**: App queries GitHub releases for newer versions
2. **Show Update Dialog**: If an update is available, a modal appears
3. **Download Update**: User can choose to download the update
4. **Install Update**: Once downloaded, the app restarts to install the update

### 3. User Experience
- **Update Available Modal**: Shows current vs new version with download option
- **Download Progress**: Real-time progress bar during download
- **Install Prompt**: Option to restart immediately or later
- **Skip Version**: Users can skip specific versions

## Configuration

### GitHub Repository Setup
1. Update the `publish` configuration in `package.json`:
```json
"publish": [
  {
    "provider": "github",
    "owner": "your-github-username",
    "repo": "elkjop-report-app",
    "private": false
  }
]
```

2. Set up GitHub token for publishing:
   - Create a GitHub personal access token with `repo` permissions
   - Set the token as an environment variable: `GH_TOKEN=your_token_here`

### Code Signing (Recommended)
For production apps, you should code sign your builds:

**Windows:**
- Purchase a code signing certificate
- Add to `package.json`:
```json
"win": {
  "certificateFile": "path/to/certificate.p12",
  "certificatePassword": "password"
}
```

**macOS:**
- Use Apple Developer account
- Add to `package.json`:
```json
"mac": {
  "identity": "Your Developer ID"
}
```

## Publishing Updates

### Automated Publishing
Use the provided script:
```bash
npm run publish-update
```

This script will:
1. Build the app
2. Create a git tag
3. Push the tag to GitHub
4. Publish to GitHub releases

### Manual Publishing
1. Update version in `package.json`
2. Build the app: `npm run electron:build`
3. Create a GitHub release with the built files
4. Tag the release with the version (e.g., `v1.7.8`)

## File Structure

```
electron/
├── handlers/
│   └── updateHandler.js    # Main update logic
├── main.js                 # Integrates update handler
└── preload.js             # Exposes update API to renderer

src/
├── components/
│   └── UpdateModal.tsx    # Update UI component
├── hooks/
│   └── useAppUpdates.ts   # React hook for updates
└── types/
    └── electron.d.ts      # TypeScript definitions

scripts/
└── publish-update.js      # Publishing script
```

## API Reference

### Main Process (updateHandler.js)
- `checkForUpdates()`: Check for available updates
- `downloadUpdate()`: Download the latest update
- `installUpdate()`: Install downloaded update
- `skipUpdate(version)`: Skip a specific version

### Renderer Process (useAppUpdates.ts)
- `checkForUpdates()`: Manual update check
- `downloadUpdate()`: Start download
- `skipUpdate()`: Skip current update
- `remindLater()`: Close modal and remind later

### Events
- `update-status`: Sent from main to renderer with update status
- `checking-for-update`: Checking for updates
- `update-available`: Update found
- `update-not-available`: No updates available
- `download-progress`: Download progress updates
- `update-downloaded`: Download complete
- `error`: Update error occurred

## Troubleshooting

### Common Issues

1. **Updates not detected**
   - Check GitHub repository configuration
   - Verify release tags match version format (v1.7.8)
   - Ensure releases are public

2. **Download fails**
   - Check network connectivity
   - Verify GitHub token permissions
   - Check release file integrity

3. **Install fails**
   - Ensure app has write permissions
   - Check antivirus software
   - Verify code signing (if applicable)

### Debug Mode
In development, updates are disabled. To test:
1. Build for production: `npm run electron:build`
2. Run the built app
3. Check console for update logs

## Security Considerations

1. **Code Signing**: Always code sign production builds
2. **HTTPS**: Updates are downloaded over HTTPS from GitHub
3. **Integrity**: Electron validates downloaded files
4. **Permissions**: App requests minimal permissions

## Migration from Tauri

The Electron auto-update system is significantly easier to implement than Tauri's:

### Tauri Challenges
- Complex update server setup required
- Manual update file management
- Limited update UI options
- Platform-specific configurations

### Electron Advantages
- Built-in `electron-updater` module
- GitHub releases integration
- Rich update UI capabilities
- Cross-platform consistency
- Extensive documentation and community support

## Future Enhancements

1. **Delta Updates**: Only download changed files
2. **Background Updates**: Download while app is running
3. **Rollback Support**: Revert to previous version
4. **Update Channels**: Beta/stable release channels
5. **Custom Update Server**: Self-hosted update server

## Support

For issues with the update system:
1. Check the console logs for error messages
2. Verify GitHub repository configuration
3. Test with a simple version bump
4. Review Electron auto-updater documentation 