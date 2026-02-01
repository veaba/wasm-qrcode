# @veaba/qrcode-rust

原生 Rust 实现的 QRCode 生成库，提供所有包中最高的性能，适合 Rust 项目和性能关键场景。

## 安装

### 作为依赖

```toml
[dependencies]
qrcode-rust = { git = "https://github.com/veaba/qrcodes", package = "qrcode-rust" }
```

### 本地路径

```toml
[dependencies]
qrcode-rust = { path = "packages/qrcode-rust" }
```

## 基础使用

### 创建 QRCode

```rust
use qrcode_rust::{QRCode, QRErrorCorrectLevel};

fn main() {
    // 创建 QRCode 实例
    let mut qr = QRCode::new("https://github.com/veaba/qrcodes");
    qr.options.correct_level = QRErrorCorrectLevel::H;
    
    // 获取 SVG
    let svg = qr.get_svg();
    println!("{}", svg);
}
```

### 指定纠错级别

```rust
use qrcode_rust::{QRCode, QRErrorCorrectLevel};

fn main() {
    let mut qr = QRCode::new("https://github.com/veaba/qrcodes");
    
    // 设置纠错级别
    qr.options.correct_level = QRErrorCorrectLevel::H;
    
    let svg = qr.get_svg();
    println!("{}", svg);
}
```

## 输出格式

### SVG 输出

```rust
use qrcode_rust::{QRCode, QRErrorCorrectLevel};

fn main() {
    let mut qr = QRCode::new("https://github.com/veaba/qrcodes");
    qr.options.correct_level = QRErrorCorrectLevel::H;
    
    // 获取 SVG 字符串
    let svg = qr.get_svg();
    
    // 保存到文件
    std::fs::write("qrcode.svg", svg).expect("Failed to write file");
}
```

### 获取模块数据

```rust
use qrcode_rust::QRCode;

fn main() {
    let mut qr = QRCode::new("https://github.com/veaba/qrcodes");
    
    // 获取模块数量
    let count = qr.get_module_count();
    println!("Module count: {}", count);
    
    // 获取模块数据
    if let Some(modules) = qr.get_modules() {
        for row in 0..count {
            for col in 0..count {
                let is_dark = modules[row as usize][col as usize].unwrap_or(false);
                print!("{}", if is_dark { "██" } else { "  " });
            }
            println!();
        }
    }
}
```

### 自定义渲染

```rust
use qrcode_rust::QRCode;

fn render_to_console(qr: &QRCode) {
    let count = qr.get_module_count();
    
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

fn main() {
    let mut qr = QRCode::new("Hello, Rust!");
    render_to_console(&qr);
}
```

## 批量生成

### 顺序生成

```rust
use qrcode_rust::QRCode;

fn main() {
    let texts: Vec<String> = (0..100)
        .map(|i| format!("https://github.com/veaba/qrcodes/{}", i))
        .collect();
    
    let mut results = Vec::new();
    
    for text in &texts {
        let mut qr = QRCode::new(text);
        results.push(qr.get_svg());
    }
    
    println!("Generated {} QR codes", results.len());
}
```

### 并行生成（使用 Rayon）

```rust
use qrcode_rust::QRCode;
use rayon::prelude::*;

fn main() {
    let texts: Vec<String> = (0..10000)
        .map(|i| format!("https://github.com/veaba/qrcodes/{}", i))
        .collect();
    
    // 并行生成
    let results: Vec<String> = texts
        .par_iter()
        .map(|text| {
            let mut qr = QRCode::new(text);
            qr.get_svg()
        })
        .collect();
    
    println!("Generated {} QR codes", results.len());
}
```

## Web 服务

### Actix-web 示例

```rust
use actix_web::{get, web, App, HttpResponse, HttpServer};
use qrcode_rust::{QRCode, QRErrorCorrectLevel};

#[get("/qrcode")]
async fn generate_qrcode(query: web::Query<QRCodeQuery>) -> HttpResponse {
    let text = query.text.clone().unwrap_or_else(|| "https://github.com/veaba/qrcodes".to_string());
    
    let mut qr = QRCode::new(&text);
    qr.options.correct_level = QRErrorCorrectLevel::H;
    
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
use qrcode_rust::{QRCode, QRErrorCorrectLevel};
use serde::Deserialize;

#[derive(Deserialize)]
struct QRCodeParams {
    text: Option<String>,
}

async fn generate_qrcode(Query(params): Query<QRCodeParams>) -> Html<String> {
    let text = params.text.unwrap_or_else(|| "https://github.com/veaba/qrcodes".to_string());
    
    let mut qr = QRCode::new(&text);
    qr.options.correct_level = QRErrorCorrectLevel::H;
    
    Html(qr.get_svg())
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/qrcode", get(generate_qrcode));
    
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    
    println!("Server running on http://127.0.0.1:3000");
    axum::serve(listener, app).await.unwrap();
}
```

## 自定义选项

### 颜色配置

```rust
use qrcode_rust::{QRCode, QRCodeOptions, QRErrorCorrectLevel};

fn main() {
    let mut qr = QRCode::new("https://github.com/veaba/qrcodes");
    
    // 自定义颜色
    qr.options.color_dark = "#FF0000".to_string();
    qr.options.color_light = "#FFFFFF".to_string();
    qr.options.correct_level = QRErrorCorrectLevel::H;
    
    let svg = qr.get_svg();
    std::fs::write("red-qrcode.svg", svg).unwrap();
}
```

## 性能优化

### 复用实例

```rust
use qrcode_rust::QRCode;

fn main() {
    // 复用同一个实例（注意：每次调用 get_svg 会基于当前状态）
    let texts = vec![
        "https://github.com/veaba/qrcodes/1",
        "https://github.com/veaba/qrcodes/2",
        "https://github.com/veaba/qrcodes/3",
    ];
    
    for text in &texts {
        let mut qr = QRCode::new(text);
        let _svg = qr.get_svg();
        // 处理 svg...
    }
}
```

## 基准测试

运行内置基准测试：

```bash
cd packages/qrcode-rust
cargo bench
```

预期结果（基于实际测试）：

```
single_generation     time:   [56.471 µs 57.807 µs 59.205 µs]
batch_generation_100  time:   [4.3020 ms 4.3896 ms 4.4835 ms]
svg_generation        time:   [43.779 µs 44.863 µs 45.967 µs]
error_level_L         time:   [35.776 µs 36.631 µs 37.482 µs]
error_level_M         time:   [35.299 µs 36.085 µs 36.870 µs]
error_level_Q         time:   [31.985 µs 32.582 µs 33.322 µs]
error_level_H         time:   [33.3 µs]
```

## 性能数据

基于实际基准测试：

| 测试项 | 平均时间 | 吞吐量 |
|--------|----------|--------|
| 单条生成 | ~57.8 µs | ~17,300 ops/s |
| SVG 生成 | ~44.9 µs | ~22,270 ops/s |
| 批量 100 条 | ~4.39 ms | ~22,780 ops/s |
| 纠错级别 L | ~36.6 µs | ~27,300 ops/s |
| 纠错级别 M | ~36.7 µs | ~27,200 ops/s |
| 纠错级别 Q | ~32.8 µs | ~30,500 ops/s |
| 纠错级别 H | ~33.3 µs | ~30,000 ops/s |

*测试环境：Rust 1.83, Windows*

## API 参考

### QRCode 结构

```rust
pub struct QRCode {
    pub options: QRCodeOptions,
    pub type_number: i32,
    pub module_count: i32,
    pub modules: Vec<Vec<Option<bool>>>,
    pub data_cache: Option<Vec<i32>>,
    pub data_list: Vec<QR8bitByte>,
}
```

### 方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `QRCode::new(text)` | 创建实例 | `QRCode` |
| `get_module_count()` | 获取模块数 | `i32` |
| `get_modules()` | 获取模块数据 | `Option<&Vec<Vec<Option<bool>>>>` |
| `is_dark(row, col)` | 判断模块颜色 | `bool` |
| `get_svg()` | 获取 SVG | `String` |

### QRErrorCorrectLevel

```rust
pub enum QRErrorCorrectLevel {
    L = 1,  // ~7%
    M = 0,  // ~15%
    Q = 3,  // ~25%
    H = 2,  // ~30%
}
```

## 何时使用原生 Rust？

- ✅ 已经是 Rust 项目
- ✅ 追求极致性能
- ✅ 需要内存安全保证
- ✅ 批量生成任务（可使用 Rayon 并行）
- ✅ 嵌入式或资源受限环境

## 与 WASM 的关系

```
Rust 源码 (packages/qrcode-rust/src/)
    │
    ├── 编译为原生库 ──► @veaba/qrcode-rust (Rust 项目使用)
    │
    └── 编译为 WASM ───► @veaba/qrcode-wasm (浏览器使用)
```

同一份 Rust 代码，编译为两种目标：

- **原生库**：最高性能，无 WASM 开销
- **WASM**：浏览器运行，跨平台
