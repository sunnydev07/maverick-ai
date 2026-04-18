#!/bin/bash
# Maverick AI - Integration Verification Script

echo "======================================"
echo "Maverick AI - Integration Verification"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

# Test 1: Node.js installed
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} ($NODE_VERSION)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Not installed"
    ((FAILED++))
fi

# Test 2: pnpm installed
echo -n "Checking pnpm... "
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓${NC} ($PNPM_VERSION)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Not installed (run: npm install -g pnpm)"
    ((FAILED++))
fi

# Test 3: Dependencies installed
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} (node_modules exists)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} (run: pnpm install)"
    ((FAILED++))
fi

# Test 4: Root tsconfig.json exists
echo -n "Checking tsconfig.json... "
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✓${NC} (exists)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} (missing)"
    ((FAILED++))
fi

# Test 5: pnpm-workspace.yaml exists
echo -n "Checking pnpm-workspace.yaml... "
if [ -f "pnpm-workspace.yaml" ]; then
    echo -e "${GREEN}✓${NC} (exists)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} (missing)"
    ((FAILED++))
fi

# Test 6: Electron package exists
echo -n "Checking electron package... "
if [ -d "packages/electron" ] && [ -f "packages/electron/package.json" ]; then
    echo -e "${GREEN}✓${NC} (found)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} (missing)"
    ((FAILED++))
fi

# Test 7: Worker package exists
echo -n "Checking worker package... "
if [ -d "packages/worker" ] && [ -f "packages/worker/package.json" ]; then
    echo -e "${GREEN}✓${NC} (found)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} (missing)"
    ((FAILED++))
fi

# Test 8: Electron scripts
echo -n "Checking electron scripts... "
if grep -q '"dev": "electron-vite dev"' packages/electron/package.json; then
    echo -e "${GREEN}✓${NC} (dev script found)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} (dev script missing)"
    ((FAILED++))
fi

# Test 9: Worker scripts
echo -n "Checking worker scripts... "
if grep -q '"dev": "wrangler dev"' packages/worker/package.json; then
    echo -e "${GREEN}✓${NC} (dev script found)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} (dev script missing)"
    ((FAILED++))
fi

# Test 10: IPC types file
echo -n "Checking IPC types... "
if [ -f "packages/electron/src/shared/ipc-types.ts" ]; then
    if grep -q "CaptureStartResponseSchema" packages/electron/src/shared/ipc-types.ts; then
        echo -e "${GREEN}✓${NC} (complete)"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} (capture types missing)"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} (file missing)"
    ((FAILED++))
fi

# Test 11: Main process IPC handlers
echo -n "Checking main process... "
if [ -f "packages/electron/src/main/index.ts" ]; then
    if grep -q "ipcMain.handle" packages/electron/src/main/index.ts; then
        echo -e "${GREEN}✓${nc} (handlers found)"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} (handlers missing)"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} (file missing)"
    ((FAILED++))
fi

# Test 12: Preload API
echo -n "Checking preload API... "
if [ -f "packages/electron/src/preload/index.ts" ]; then
    if grep -q "contextBridge.exposeInMainWorld" packages/electron/src/preload/index.ts; then
        echo -e "${GREEN}✓${NC} (API exposed)"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} (API not exposed)"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} (file missing)"
    ((FAILED++))
fi

# Test 13: Worker API routes
echo -n "Checking worker routes... "
if [ -f "packages/worker/src/index.ts" ]; then
    if grep -q "app.post('/llm'" packages/worker/src/index.ts; then
        echo -e "${GREEN}✓${NC} (routes found)"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} (routes missing)"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} (file missing)"
    ((FAILED++))
fi

# Test 14: Documentation files
echo -n "Checking documentation... "
DOCS=0
[ -f "README.md" ] && ((DOCS++))
[ -f "QUICKSTART.md" ] && ((DOCS++))
[ -f "SETUP.md" ] && ((DOCS++))
[ -f "INTEGRATION.md" ] && ((DOCS++))
[ -f "CODEBASE_AUDIT.md" ] && ((DOCS++))

if [ $DOCS -ge 5 ]; then
    echo -e "${GREEN}✓${NC} ($DOCS files)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} ($DOCS files)"
    ((FAILED++))
fi

# Summary
echo ""
echo "======================================"
echo "Test Results:"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "======================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready to develop.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. pnpm install     (if not done)"
    echo "  2. pnpm build       (build packages)"
    echo "  3. pnpm dev         (start services)"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. See above for details.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  • Install Node.js from https://nodejs.org"
    echo "  • Run: npm install -g pnpm"
    echo "  • Run: pnpm install"
    echo "  • Run: pnpm build"
    exit 1
fi
