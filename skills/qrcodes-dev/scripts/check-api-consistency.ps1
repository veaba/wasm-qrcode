# Check API consistency between qrcode-js and qrcode-wasm
$ErrorActionPreference = "Stop"

Write-Host "Checking API consistency between qrcode-js and qrcode-wasm..." -ForegroundColor Yellow

$jsApi = Get-Content packages/qrcode-js/src/index.ts -Raw
$wasmApi = Get-Content packages/qrcode-wasm/src/lib.rs -Raw 2>$null

if (-not $wasmApi) {
    Write-Host "Warning: Could not read qrcode-wasm source. Make sure wasm source is available." -ForegroundColor Red
    exit 1
}

# Extract export names from JS
$jsExports = [regex]::Matches($jsApi, 'export\s+(?:function|class|const|interface)\s+(\w+)') | ForEach-Object { $_.Groups[1].Value }

Write-Host "`nJS Exports found: $($jsExports -join ', ')" -ForegroundColor Cyan

# Check for common patterns
$commonPatterns = @('generate', 'QRCode', 'Options', 'toSVG', 'toDataURL')

Write-Host "`nChecking common patterns..." -ForegroundColor Cyan
foreach ($pattern in $commonPatterns) {
    $jsHas = $jsApi -match $pattern
    $wasmHas = $wasmApi -match $pattern
    
    if ($jsHas -and $wasmHas) {
        Write-Host "  $pattern : JS [OK] | WASM [OK]" -ForegroundColor Green
    } elseif ($jsHas) {
        Write-Host "  $pattern : JS [OK] | WASM [MISSING]" -ForegroundColor Red
    } elseif ($wasmHas) {
        Write-Host "  $pattern : JS [MISSING] | WASM [OK]" -ForegroundColor Red
    } else {
        Write-Host "  $pattern : Not found in either" -ForegroundColor Gray
    }
}

Write-Host "`nAPI consistency check completed." -ForegroundColor Green
