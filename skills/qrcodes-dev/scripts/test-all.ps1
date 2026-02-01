# Run all tests
$ErrorActionPreference = "Stop"

Write-Host "Running unit tests..." -ForegroundColor Green
pnpm run test:unit

Write-Host "Running browser tests..." -ForegroundColor Green
pnpm run test:browser

Write-Host "All tests completed!" -ForegroundColor Green
