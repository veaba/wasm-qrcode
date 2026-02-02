# @veaba/qrcode-fast

极致性能优化的 Rust QRCode 生成库，采用一维数组存储、预分配内存、内联函数等优化技术，比 `@veaba/qrcode-rust` 快 **2.5-4.4 倍**，比社区流行的 `kennytm-qrcode` 快 **37-75 倍**。

## 安装

### 作为依赖

```toml
[dependencies]
qrcode-fast = { git = "https://github.com/veaba/qrcodes", package = "qrcode-fast" }
```

### 本地路径

```toml
[dependencies]
qrcode-fast = { path = "packages/qrcode-fast" }
```

## 基础使用

### 创建 QRCode

```rust
use qrcode_fast::{QRCode, QRErrorCorrectLevel};

fn main() {
    // 创建 QRCode 实例，指定纠错级别
    let mut qr = QRCode::with_options(QRErrorCorrectLevel::H);
    qr.make_code("https://github.com/veaba/qrcodes");

    // 获取 SVG
    let svg = qr.get_svg();
    println!("{}", svg);
}
```

### 不同纠错级别

```rust
use qrcode_fast::{QRCode, QRErrorCorrectLevel};

fn main() {
    let texts = vec!["Hello", "World", "QRCode"];

    for level in [QRErrorCorrectLevel::L, QRErrorCorrectLevel::M,
                  QRErrorCorrectLevel::Q, QRErrorCorrectLevel::H] {
        let mut qr = QRCode::with_options(level);
        qr.make_code(&texts.join(" "));
        let svg = qr.get_svg();
        // 保存或使用 svg...
    }
}
```

## 输出格式

### SVG 输出（推荐）

```rust
use qrcode_fast::{QRCode, QRErrorCorrectLevel};

fn main() {
    let mut qr = QRCode::with_options(QRErrorCorrectLevel::H);
    qr.make_code("https://github.com/veaba/qrcodes");

    // 获取 SVG 字符串
    let svg = qr.get_svg();

    // 保存到文件
    std::fs::write("qrcode.svg", svg).expect("Failed to write file");
    println!("SVG saved to qrcode.svg");
}
```

### 获取模块数据

```rust
use qrcode_fast::{QRCode, QRErrorCorrectLevel};

fn main() {
    let mut qr = QRCode::with_options(QRErrorCorrectLevel::M);
    qr.make_code("Hello, Fast QRCode!");

    // 获取模块数量
    let count = qr.get_module_count();
    println!("Module count: {}x{}", count, count);

    // 终端渲染
    for row in 0..count {
        for col in 0..count {
            if qr.is_dark(row, col) {
                print!("██");
            } else {
                print!("  ");
            }
        }
        println!();
    }
}
```

## 批量生成

### 顺序生成

```rust
use qrcode_fast::QRCode;

fn main() {
    let texts: Vec<String> = (0..100)
        .map(|i| format!("https://github.com/veaba/qrcodes/{}", i))
        .collect();

    let start = std::time::Instant::now();

    let results: Vec<String> = texts
        .iter()
        .map(|text| {
            let mut qr = QRCode::new();
            qr.make_code(text);
            qr.get_svg()
        })
        .collect();

    let duration = start.elapsed();
    println!("Generated {} QR codes in {:?}", results.len(), duration);
    println!("Average: {:.2} µs per QR code", duration.as_micros() as f64 / results.len() as f64);
}
```

### 并行生成（使用 Rayon）

```rust
use qrcode_fast::QRCode;
use rayon::prelude::*;

fn main() {
    let texts: Vec<String> = (0..10000)
        .map(|i| format!("https://github.com/veaba/qrcodes/{}", i))
        .collect();

    let start = std::time::Instant::now();

    // 并行生成，充分利用多核性能
    let results: Vec<String> = texts
        .par_iter()
        .map(|text| {
            let mut qr = QRCode::new();
            qr.make_code(text);
            qr.get_svg()
        })
        .collect();

    let duration = start.elapsed();
    println!("Generated {} QR codes in {:?}", results.len(), duration);
    println!("Throughput: {:.0} QR codes/second", results.len() as f64 / duration.as_secs_f64());
}
```

## Web 服务

### Actix-web 示例

```rust
use actix_web::{get, web, App, HttpResponse, HttpServer};
use qrcode_fast::{QRCode, QRErrorCorrectLevel};

#[get("/qrcode")]
async fn generate_qrcode(query: web::Query<QRCodeQuery>) -> HttpResponse {
    let text = query.text.clone().unwrap_or_else(|| "https://github.com/veaba/qrcodes".to_string());

    let mut qr = QRCode::with_options(QRErrorCorrectLevel::H);
    qr.make_code(&text);

    let svg = qr.get_svg();

    HttpResponse::Ok()
        .content_type("image/svg+xml")
        .body(svg)
}

#[derive(serde::Deserialize)]
struct QRCodeQuery {
    text: Option<String>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(generate_qrcode)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

### Axum 示例

```rust
use axum::{
    extract::Query,
    response::Html,
    routing::get,
    Router,
};
use qrcode_fast::{QRCode, QRErrorCorrectLevel};
use serde::Deserialize;

#[derive(Deserialize)]
struct QRCodeParams {
    text: Option<String>,
}

async fn generate_qrcode(Query(params): Query<QRCodeParams>) -> Html<String> {
    let text = params.text.unwrap_or_else(|| "https://github.com/veaba/qrcodes".to_string());

    let mut qr = QRCode::with_options(QRErrorCorrectLevel::H);
    qr.make_code(&text);

    Html(qr.get_svg())
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/qrcode", get(generate_qrcode));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();

    println!("QRCode Server running on http://127.0.0.1:3000");
    axum::serve(listener, app).await.unwrap();
}
```

## 性能优化技术

### 1. 一维数组存储

```rust
// qrcode-fast 使用一维 Vec<u8> 存储
modules: Vec<u8>  // 0=未设置, 1=深色, 2=已设置浅色

// 访问方式：idx = row * module_count + col
let idx = (row as usize) * (self.module_count as usize) + (col as usize);
```

**优势**：
- 连续内存布局，CPU 缓存友好
- 单次内存分配
- 减少指针跳转开销

### 2. 精确的容量预分配

```rust
// 统计深色模块数量，精确预分配 SVG 字符串容量
let dark_count: usize = self.modules.iter().map(|&m| (m == 1) as usize).sum();
let path_capacity = dark_count * 25;  // 每个模块约 25 字节
let mut svg = String::with_capacity(200 + path_capacity);
```

**优势**：避免动态扩容，减少内存重分配

### 3. 内联数字转换

```rust
#[inline(always)]
fn push_i32(s: &mut String, mut n: i32) {
    // 自定义数字转字符串，避免 format! 开销
    let mut buf = [0u8; 10];
    let mut i = 10;
    while n > 0 {
        i -= 1;
        buf[i] = (n % 10) as u8 + b'0';
        n /= 10;
    }
    s.push_str(unsafe { std::str::from_utf8_unchecked(&buf[i..]) });
}
```

**优势**：比 `to_string()` 或 `format!` 快约 3-5 倍

## 与其他库的性能对比

### SVG 生成性能（100次运行，平均时间）

| 测试用例 | @veaba/qrcode-fast | @veaba/qrcode-rust | kennytm-qrcode | 速度提升 |
|---------|-------------------|-------------------|----------------|----------|
| Simple ("Hello World") | **10.81 µs** | 47.70 µs | 815.75 µs | 比 rust 快 **4.4x**，比 kennytm 快 **75x** |
| Complex ("Test QR Code 123") | **18.42 µs** | 46.22 µs | 688.92 µs | 比 rust 快 **2.5x**，比 kennytm 快 **37x** |

### 单条生成性能

| 测试项 | @veaba/qrcode-fast | @veaba/qrcode-rust | kennytm-qrcode | 速度提升 |
|--------|-------------------|-------------------|----------------|----------|
| 单条生成 (medium) | **54,283 ops/s** | 21,635 ops/s | 1,451 ops/s | 比 rust 快 **2.5x**，比 kennytm 快 **37x** |
| 纠错级别 L | **61,368 ops/s** | - | - | - |
| 纠错级别 M | **41,950 ops/s** | - | - | - |
| 纠错级别 Q | **49,062 ops/s** | - | - | - |
| 纠错级别 H | **47,436 ops/s** | - | - | - |

### 对比总结

| 对比 | 速度提升 |
|------|----------|
| `@veaba/qrcode-fast` vs `@veaba/qrcode-rust` | **2.5x - 4.4x** |
| `@veaba/qrcode-fast` vs `kennytm-qrcode` | **36.7x - 75.5x** |
| `@veaba/qrcode-rust` vs `kennytm-qrcode` | **13.0x - 17.1x** |

## 基准测试

运行内置基准测试：

```bash
cd packages/qrcode-fast
cargo bench --bench comparison_bench
```

### SVG 基准测试

使用 `bench/rust-tools` 进行 SVG 性能对比：

```bash
cd bench/rust-tools
cargo run --release --features validation --bin benchmark-full
```

## SVG 验证

使用 `bench/rust-tools` 验证生成的 SVG：

```bash
cd bench/rust-tools
cargo run --release --features validation --bin veaba-qr -- "Hello World"
```

输出示例：
```
🚀 @veaba QRCode 生成器
═══════════════════════════════════════
文本: Hello World

📦 @veaba/qrcode-fast
───────────────────────────────────────
⏱️  生成耗时: 48.6µs
📐 二维码版本: 1 (21x21 模块)
📄 SVG 大小: 4187 bytes
🔍 验证中...
✅ 验证通过！
```

## API 参考

### QRCode 结构

```rust
pub struct QRCode {
    pub options: QRCodeOptions,
    pub module_count: i32,
    pub type_number: i32,
    modules: Vec<u8>,  // 一维数组：modules[row * module_count + col]
    data_list: Vec<QR8bitByte>,
}
```

### QRCodeOptions

```rust
#[derive(Clone)]
pub struct QRCodeOptions {
    pub color_dark: String,
    pub color_light: String,
    pub correct_level: QRErrorCorrectLevel,
}
```

### QRErrorCorrectLevel

```rust
pub enum QRErrorCorrectLevel {
    L = 1,  // ~7% 纠错
    M = 0,  // ~15% 纠错
    Q = 3,  // ~25% 纠错
    H = 2,  // ~30% 纠错
}
```

### 方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `QRCode::new()` | 创建默认实例 | `QRCode` |
| `QRCode::with_options(level)` | 创建实例并指定纠错级别 | `QRCode` |
| `make_code(text)` | 生成二维码 | `()` |
| `get_svg()` | 获取 SVG 字符串 | `String` |
| `get_module_count()` | 获取模块数量 | `i32` |
| `is_dark(row, col)` | 判断指定位置是否为深色 | `bool` |

## 何时使用 @veaba/qrcode-fast？

### 推荐使用场景

- ✅ 追求极致性能（比 qrcode-rust 快 2.5-4.4 倍）
- ✅ 大批量生成任务
- ✅ 高并发 Web 服务
- ✅ 嵌入式或资源受限环境
- ✅ 需要 SVG 输出的场景

### 与 @veaba/qrcode-rust 的选择

| 场景 | 推荐包 | 原因 |
|------|--------|------|
| 极致性能 | `@veaba/qrcode-fast` | 最快的生成速度 |
| 功能完整 | `@veaba/qrcode-rust` | API 更完整，兼容性好 |

### 架构关系

```
Rust 源码
    │
    ├── @veaba/qrcode-rust ──► 功能完整，API 兼容性好
    │
    └── @veaba/qrcode-fast ──► 极致优化，性能优先
```

两个包采用相同的 QRCode 算法，主要区别在于：

1. **数据结构**：fast 使用一维数组，rust 使用二维数组
2. **内存分配**：fast 精确预分配，rust 估算预分配
3. **字符串构建**：fast 自定义内联函数，rust 使用 `write!` 宏
4. **函数内联**：fast 使用 `#[inline(always)]`，rust 使用默认内联

## 性能数据

基于实际基准测试（2026-02-02，Windows，Rust 1.89.0）：

| 测试项 | 平均时间 | 吞吐量 |
|--------|----------|--------|
| 单条生成 | ~18.42 µs | ~54,283 ops/s |
| SVG 生成 | ~10.81 µs | ~92,486 ops/s |
| 纠错级别 L | ~16.30 µs | ~61,368 ops/s |
| 纠错级别 M | ~23.84 µs | ~41,950 ops/s |
| 纠错级别 Q | ~20.38 µs | ~49,062 ops/s |
| 纠错级别 H | ~21.08 µs | ~47,436 ops/s |

## 编译优化

确保使用 release 配置以获得最佳性能：

```toml
[profile.release]
opt-level = 3      # 最高优化级别
lto = true         # 链接时优化
codegen-units = 1  # 单个编译单元，更好的优化
```

编译命令：

```bash
cargo build --release
```

## 更新记录

### 2026-02-03

- 新增 `@veaba/qrcode-fast` 文档
- 添加性能对比数据
- 添加使用示例和最佳实践
