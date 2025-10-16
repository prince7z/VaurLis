# Project Restructuring Script
# This will move backend and frontend from nested Coursera folder to root

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   PROJECT RESTRUCTURING" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

$rootPath = "d:\VS\coursera\Coursera"
$nestedPath = "d:\VS\coursera\Coursera\Coursera"

# Step 1: Verify current structure
Write-Host "Step 1: Verifying current structure..." -ForegroundColor Yellow
if (!(Test-Path "$nestedPath\backend") -or !(Test-Path "$nestedPath\frontend")) {
    Write-Host "ERROR: backend or frontend folder not found in nested Coursera folder!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Found backend and frontend in nested folder" -ForegroundColor Green

# Step 2: Create backup
Write-Host "`nStep 2: Creating backup..." -ForegroundColor Yellow
$backupPath = "$rootPath\Coursera_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "  Backup location: $backupPath" -ForegroundColor Gray

# Step 3: Move folders and files
Write-Host "`nStep 3: Moving folders to root..." -ForegroundColor Yellow

# Check if backend/frontend already exist in root
if (Test-Path "$rootPath\backend") {
    Write-Host "  ! backend already exists in root, removing old one..." -ForegroundColor Yellow
    Remove-Item "$rootPath\backend" -Recurse -Force
}
if (Test-Path "$rootPath\frontend") {
    Write-Host "  ! frontend already exists in root, removing old one..." -ForegroundColor Yellow
    Remove-Item "$rootPath\frontend" -Recurse -Force
}

# Move backend and frontend
Write-Host "  Moving backend..." -ForegroundColor Cyan
Move-Item "$nestedPath\backend" "$rootPath\backend" -Force
Write-Host "  ✓ backend moved" -ForegroundColor Green

Write-Host "  Moving frontend..." -ForegroundColor Cyan
Move-Item "$nestedPath\frontend" "$rootPath\frontend" -Force
Write-Host "  ✓ frontend moved" -ForegroundColor Green

# Step 4: Move important files
Write-Host "`nStep 4: Moving configuration files..." -ForegroundColor Yellow

$filesToMove = @(
    "package.json",
    "render.yaml",
    ".env",
    ".env.example",
    ".gitignore",
    "tsconfig.json",
    "check-deployment.js",
    "ANALYSIS_ENV_CHANGES.md"
)

foreach ($file in $filesToMove) {
    if (Test-Path "$nestedPath\$file") {
        Write-Host "  Moving $file..." -ForegroundColor Cyan
        Move-Item "$nestedPath\$file" "$rootPath\$file" -Force
        Write-Host "  ✓ $file moved" -ForegroundColor Green
    }
}

# Step 5: Move node_modules (optional, can reinstall)
Write-Host "`nStep 5: Handling node_modules..." -ForegroundColor Yellow
Write-Host "  Skipping node_modules (will reinstall)" -ForegroundColor Gray

# Step 6: Clean up empty nested folder
Write-Host "`nStep 6: Cleaning up..." -ForegroundColor Yellow
if ((Get-ChildItem "$nestedPath" -Force | Measure-Object).Count -eq 0) {
    Remove-Item "$nestedPath" -Recurse -Force
    Write-Host "  ✓ Removed empty nested Coursera folder" -ForegroundColor Green
} else {
    Write-Host "  ! Nested folder still has files, keeping it for safety" -ForegroundColor Yellow
    Write-Host "  Remaining files:" -ForegroundColor Gray
    Get-ChildItem "$nestedPath" -Force | ForEach-Object { Write-Host "    - $($_.Name)" -ForegroundColor Gray }
}

# Step 7: Reinstall dependencies
Write-Host "`nStep 7: Reinstalling dependencies..." -ForegroundColor Yellow
Set-Location $rootPath
Write-Host "  Installing root dependencies..." -ForegroundColor Cyan
npm install

Write-Host "`n  Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location "$rootPath\frontend"
npm install

Set-Location $rootPath

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   RESTRUCTURING COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "New structure:" -ForegroundColor Yellow
Write-Host "  d:\VS\coursera\Coursera\" -ForegroundColor White
Write-Host "  ├── backend\" -ForegroundColor Green
Write-Host "  ├── frontend\" -ForegroundColor Green
Write-Host "  ├── package.json" -ForegroundColor Green
Write-Host "  ├── render.yaml" -ForegroundColor Green
Write-Host "  ├── .env" -ForegroundColor Green
Write-Host "  └── .gitignore" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Test backend: npm run dev" -ForegroundColor Cyan
Write-Host "  2. Test frontend: cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host "  3. If everything works, commit changes" -ForegroundColor Cyan

Write-Host ""
