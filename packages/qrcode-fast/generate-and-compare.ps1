# QRCode 生成与对比脚本
# 使用方法: .\generate-and-compare.ps1 ["文本"] [输出目录]
# 示例: .\generate-and-compare.ps1 "Hello World" .\output

param(
    [string]$Text = "https://github.com/veaba/qrcodes",
    [string]$OutputDir = "."
)

# 确保输出目录存在
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🚀 qrcode-fast 生成与对比工具                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "文本: $Text" -ForegroundColor Yellow
Write-Host "输出目录: $OutputDir" -ForegroundColor Yellow
Write-Host ""

# 检查是否已编译
$svgGenPath = ".\target\release\svg-gen.exe"
$comparePath = ".\target\release\compare-svgs.exe"

if (-not (Test-Path $svgGenPath) -or -not (Test-Path $comparePath)) {
    Write-Host "正在编译..." -ForegroundColor Yellow
    cargo build --release --bin svg-gen --bin compare-svgs 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 编译失败！" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 编译完成！" -ForegroundColor Green
    Write-Host ""
}

# 运行对比
Write-Host "══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "运行性能对比..." -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

& $comparePath $Text

# 移动生成的文件到输出目录
if ($OutputDir -ne ".") {
    Move-Item -Force "qrcode_fast_output.svg" "$OutputDir\" 2>$null
    Move-Item -Force "qrcode_kennytm_output.svg" "$OutputDir\" 2>$null
    Write-Host ""
    Write-Host "📁 SVG 文件已保存到: $OutputDir" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ 完成！" -ForegroundColor Green
