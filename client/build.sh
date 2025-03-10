#!/bin/bash

# Print Node.js and npm versions
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Install dependencies with legacy peer deps flag
npm install --legacy-peer-deps

# Set NODE_OPTIONS to handle potential OpenSSL issues with newer Node versions
export NODE_OPTIONS=--openssl-legacy-provider

# Build with CI=false to ignore warnings
CI=false npm run build

# Ensure favicon files are in the build directory
echo "Verifying favicon files..."
if [ ! -f "build/favicon.ico" ]; then
  echo "Copying favicon.ico to build directory"
  cp public/favicon.ico build/
fi

if [ ! -f "build/favicon.svg" ]; then
  echo "Copying favicon.svg to build directory"
  cp public/favicon.svg build/
fi

echo "Build completed successfully!" 