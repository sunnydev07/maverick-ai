@echo off
REM Maverick AI - Integration Verification Script (Windows)

setlocal enabledelayedexpansion

cls
echo ======================================
echo Maverick AI - Integration Verification
echo ======================================
echo.

set PASSED=0
set FAILED=0

REM Test 1: Node.js installed
echo Checking Node.js...
node -v >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo [OK] !NODE_VERSION!
    set /a PASSED+=1
) else (
    echo [FAIL] Not installed
    set /a FAILED+=1
)

REM Test 2: pnpm installed
echo Checking pnpm...
pnpm -v >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('pnpm -v') do set PNPM_VERSION=%%i
    echo [OK] !PNPM_VERSION!
    set /a PASSED+=1
) else (
    echo [FAIL] Not installed. Run: npm install -g pnpm
    set /a FAILED+=1
)

REM Test 3: Dependencies installed
echo Checking dependencies...
if exist "node_modules" (
    echo [OK] node_modules exists
    set /a PASSED+=1
) else (
    echo [WARN] Run: pnpm install
    set /a FAILED+=1
)

REM Test 4: Root tsconfig.json
echo Checking tsconfig.json...
if exist "tsconfig.json" (
    echo [OK] exists
    set /a PASSED+=1
) else (
    echo [FAIL] missing
    set /a FAILED+=1
)

REM Test 5: pnpm-workspace.yaml
echo Checking pnpm-workspace.yaml...
if exist "pnpm-workspace.yaml" (
    echo [OK] exists
    set /a PASSED+=1
) else (
    echo [FAIL] missing
    set /a FAILED+=1
)

REM Test 6: Electron package
echo Checking electron package...
if exist "packages\electron\package.json" (
    echo [OK] found
    set /a PASSED+=1
) else (
    echo [FAIL] missing
    set /a FAILED+=1
)

REM Test 7: Worker package
echo Checking worker package...
if exist "packages\worker\package.json" (
    echo [OK] found
    set /a PASSED+=1
) else (
    echo [FAIL] missing
    set /a FAILED+=1
)

REM Test 8: Electron main process
echo Checking electron main process...
if exist "packages\electron\src\main\index.ts" (
    echo [OK] found
    set /a PASSED+=1
) else (
    echo [FAIL] missing
    set /a FAILED+=1
)

REM Test 9: Electron preload
echo Checking electron preload...
if exist "packages\electron\src\preload\index.ts" (
    echo [OK] found
    set /a PASSED+=1
) else (
    echo [FAIL] missing
    set /a FAILED+=1
)

REM Test 10: IPC types
echo Checking IPC types...
if exist "packages\electron\src\shared\ipc-types.ts" (
    echo [OK] found
    set /a PASSED+=1
) else (
    echo [FAIL] missing
    set /a FAILED+=1
)

REM Test 11: Worker API
echo Checking worker API...
if exist "packages\worker\src\index.ts" (
    echo [OK] found
    set /a PASSED+=1
) else (
    echo [FAIL] missing
    set /a FAILED+=1
)

REM Test 12: Worker schemas
echo Checking worker schemas...
if exist "packages\worker\src\schemas.ts" (
    echo [OK] found
    set /a PASSED+=1
) else (
    echo [FAIL] missing
    set /a FAILED+=1
)

REM Test 13: Documentation
echo Checking documentation...
set DOCS=0
if exist "README.md" (set /a DOCS+=1)
if exist "QUICKSTART.md" (set /a DOCS+=1)
if exist "SETUP.md" (set /a DOCS+=1)
if exist "INTEGRATION.md" (set /a DOCS+=1)
if exist "CODEBASE_AUDIT.md" (set /a DOCS+=1)

if !DOCS! geq 5 (
    echo [OK] !DOCS! documentation files
    set /a PASSED+=1
) else (
    echo [WARN] !DOCS! documentation files
    set /a FAILED+=1
)

echo.
echo ======================================
echo Test Results:
echo Passed: !PASSED!
echo Failed: !FAILED!
echo ======================================

if !FAILED! equ 0 (
    echo.
    echo All checks passed! Ready to develop.
    echo.
    echo Next steps:
    echo   1. pnpm install     ^(if not done^)
    echo   2. pnpm build       ^(build packages^)
    echo   3. pnpm dev         ^(start services^)
    exit /b 0
) else (
    echo.
    echo Some checks failed. See above for details.
    echo.
    echo Common fixes:
    echo   • Install Node.js from https://nodejs.org
    echo   • Run: npm install -g pnpm
    echo   • Run: pnpm install
    echo   • Run: pnpm build
    exit /b 1
)

endlocal
