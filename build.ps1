param(
    [string]$Version = "1.0.0"
)

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$DistDir = Join-Path $ProjectRoot "dist"
$PackageName = "tapd-helper-v$Version.zip"
$PackagePath = Join-Path $DistDir $PackageName

if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir -Force | Out-Null
}

Write-Host "Building TAPD Helper v$Version..." -ForegroundColor Cyan

$FilesToInclude = @(
    "manifest.json",
    "background.js",
    "content_script.js",
    "lib\dark-theme.js",
    "popup\popup.html",
    "popup\popup.js",
    "popup\popup.css",
    "options\options.html",
    "options\options.js",
    "options\options.css",
    "images\icon16.png",
    "images\icon48.png",
    "images\icon128.png",
    "README.md",
    "LICENSE.txt"
)

$MissingFiles = @()
foreach ($File in $FilesToInclude) {
    $FullPath = Join-Path $ProjectRoot $File
    if (-not (Test-Path $FullPath)) {
        $MissingFiles += $File
    }
}

if ($MissingFiles.Count -gt 0) {
    Write-Host "WARNING: Missing files:" -ForegroundColor Yellow
    foreach ($F in $MissingFiles) {
        Write-Host "  - $F" -ForegroundColor Yellow
    }
}

if (Test-Path $PackagePath) {
    Remove-Item $PackagePath -Force
}

$FullPaths = $FilesToInclude | ForEach-Object { Join-Path $ProjectRoot $_ }
Compress-Archive -Path $FullPaths -DestinationPath $PackagePath

Write-Host "Package created:" -ForegroundColor Green
Write-Host "  $PackagePath" -ForegroundColor Green
Write-Host ""
Write-Host "File size: $([math]::Round((Get-Item $PackagePath).Length / 1KB)) KB" -ForegroundColor Green

Write-Host ""
Write-Host "To install in Chrome:" -ForegroundColor Cyan
Write-Host "  1. Open chrome://extensions" -ForegroundColor White
Write-Host "  2. Enable 'Developer mode'" -ForegroundColor White
Write-Host "  3. Drag & drop the zip file onto the page" -ForegroundColor White
Write-Host "  OR extract and click 'Load unpacked'" -ForegroundColor White
