#!/bin/bash

cd /vercel/share/v0-project

# Configure git if needed
git config user.email "v0@vercel.dev" || true
git config user.name "v0 AI" || true

# Add all changes
git add -A

# Commit with the specified message
git commit -m "6th phase completed" || true

# Show the commit log
git log --oneline -1

echo "Phase 6 committed successfully"
