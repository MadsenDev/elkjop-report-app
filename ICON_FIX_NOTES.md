# Windows Icon Fix

## Changes Made

1. **Enhanced Windows build configuration** in `package.json`:
   - Added `requestedExecutionLevel: "asInvoker"` for proper UAC handling
   - Added `publisherName` for better Windows integration
   - Enhanced NSIS installer configuration with explicit icon settings
   - Added proper shortcut creation with custom name

2. **NSIS Installer Configuration**:
   - `installerIcon`: Icon for the installer executable
   - `uninstallerIcon`: Icon for the uninstaller
   - `installerHeaderIcon`: Icon in the installer header
   - `createDesktopShortcut`: Creates desktop shortcut with proper icon
   - `createStartMenuShortcut`: Creates start menu shortcut

3. **Product Name**: Changed to "Elkjøp Report App" for better display

## To Apply the Fix

1. **Clean build** (important for icon changes):
   ```bash
   npm run electron:build
   ```

2. **If icon still doesn't appear**:
   - Windows may be caching the old icon
   - Try clearing Windows icon cache:
     - Open Command Prompt as Administrator
     - Run: `ie4uinit.exe -show`
     - Restart Windows Explorer or reboot

3. **Alternative**: Uninstall the old version completely before installing the new one

## Icon Files

The following icon files are properly configured:
- `electron/icons/icon.ico` (Windows)
- `electron/icons/icon.icns` (macOS)
- `electron/icons/icon.png` (Linux)

All files exist and are properly referenced in the build configuration.
