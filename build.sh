#!/bin/bash

echo "Building for Linux..."
cargo tauri build --target x86_64-unknown-linux-gnu

echo "Building for Windows..."
cargo tauri build --target x86_64-pc-windows-gnu

echo "Build complete! Portable executables and assets are available at:"
echo "Linux: src-tauri/target/x86_64-unknown-linux-gnu/release/elkjop-report-app"
echo "Windows: src-tauri/target/x86_64-pc-windows-gnu/release/elkjop-report-app.exe"
echo "Assets: dist/ (place this folder next to the .exe and .dll)" 