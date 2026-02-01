# Build all packages in the correct order
$ErrorActionPreference = "Stop"

Write-Host "Building @veaba/qrcode-shared..." -ForegroundColor Green
Set-Location packages/qrcode-shared
pnpm run build
Set-Location ../..

Write-Host "Building @veaba/qrcode-js..." -ForegroundColor Green
Set-Location packages/qrcode-js
pnpm run build
Set-Location ../..

Write-Host "Building @veaba/qrcode-node..." -ForegroundColor Green
Set-Location packages/qrcode-node
pnpm run build
Set-Location ../..

Write-Host "Building @veaba/qrcode-bun..." -ForegroundColor Green
Set-Location packages/qrcode-bun
pnpm run build
Set-Location ../..

Write-Host "Building @veaba/qrcode-wasm..." -ForegroundColor Green
Set-Location packages/qrcode-wasm
pnpm run build
Set-Location ../..

Write-Host "Building @veaba/qrcode-rust..." -ForegroundColor Green
Set-Location packages/qrcode-rust
cargo build --release
Set-Location ../..

Write-Host "Building @veaba/qrcode-fast..." -ForegroundColor Green
Set-Location packages/qrcode-fast
cargo build --release
Set-Location ../..

Write-Host "All packages built successfully!" -ForegroundColor Green
