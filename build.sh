#!/bin/bash

# Default values
BUILD_LINUX=true
BUILD_WINDOWS=true

# Help message
show_help() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -l    Build for Linux only"
    echo "  -w    Build for Windows only"
    echo "  -h    Show this help message"
    echo ""
    echo "If no options are provided, builds for both platforms"
    exit 0
}

# Parse command line options
while getopts "lwh" opt; do
    case $opt in
        l)
            BUILD_LINUX=true
            BUILD_WINDOWS=false
            ;;
        w)
            BUILD_LINUX=false
            BUILD_WINDOWS=true
            ;;
        h)
            show_help
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            show_help
            ;;
    esac
done

# Update version
npm run update-version

echo "Building Vite app..."
npm run build

# Build for Linux if enabled
if [ "$BUILD_LINUX" = true ]; then
    echo "Building Electron app for Linux..."
    npm run electron:build -- --linux
fi

# Build for Windows if enabled
if [ "$BUILD_WINDOWS" = true ]; then
    echo "Building Electron app for Windows..."
    npm run electron:build -- --win
fi

# Create data directories if they don't exist
echo "Creating data directories..."
mkdir -p dist_electron/data

# Copy data files to build directory
echo "Copying data files..."
echo "Source directory contents:"
ls -la public/data/

echo "Copying to build directory..."
cp -v public/data/*.json dist_electron/data/
echo "Build data directory contents:"
ls -la dist_electron/data/

echo "Build complete! Installers and portable executables are available in:"
echo "dist_electron/"
echo "Data files are in the 'data' folder next to the executables" 