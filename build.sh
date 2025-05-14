#!/bin/bash

npm run update-version

echo "Building for Linux..."
cargo tauri build --target x86_64-unknown-linux-gnu

echo "Building for Windows..."
cargo tauri build --target x86_64-pc-windows-gnu

# Create data directories if they don't exist
echo "Creating data directories..."
mkdir -p src-tauri/target/x86_64-unknown-linux-gnu/release/data
mkdir -p src-tauri/target/x86_64-pc-windows-gnu/release/data

# Copy data files to both build directories
echo "Copying data files..."
echo "Source directory contents:"
ls -la public/data/

echo "Copying to Linux build..."
cp -v public/data/*.json src-tauri/target/x86_64-unknown-linux-gnu/release/data/
echo "Linux data directory contents:"
ls -la src-tauri/target/x86_64-unknown-linux-gnu/release/data/

echo "Copying to Windows build..."
cp -v public/data/*.json src-tauri/target/x86_64-pc-windows-gnu/release/data/
echo "Windows data directory contents:"
ls -la src-tauri/target/x86_64-pc-windows-gnu/release/data/

echo "Build complete! Portable executables and assets are available at:"
echo "Linux: src-tauri/target/x86_64-unknown-linux-gnu/release/elkjop-report-app"
echo "Windows: src-tauri/target/x86_64-pc-windows-gnu/release/elkjop-report-app.exe"
echo "Data files are in the 'data' folder next to the executables" 