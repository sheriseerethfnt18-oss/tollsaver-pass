#!/bin/bash

# Build script for generating static files
echo "Building TravelPass static files..."

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the project
echo "Building project..."
npm run build

# Create builded directory
echo "Creating builded directory..."
mkdir -p builded

# Copy build files to builded
echo "Copying files to builded..."
cp -r dist/* builded/

# Create a simple index file for the builded directory
echo "Creating builded/README.md..."
cat > builded/README.md << 'EOF'
# TravelPass Static Build

This directory contains the compiled static files for the TravelPass application.

## Files:
- `index.html` - Main application entry point
- `assets/` - CSS, JS, and other static assets
- `favicon.png` - Application favicon

## Deployment:
These files can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Amazon S3
- Any web server

## Last Build:
EOF

echo "$(date)" >> builded/README.md

echo "Static build complete! Files are in the 'builded' directory."
echo "You can now commit and push the builded folder to GitHub."