# @veaba/qrcode-rust

原生 Rust 实现的 QRCode 生成库，提供所有包中最高的性能，适合 Rust 项目和性能关键场景。

## 安装

### 作为依赖

```toml
[dependencies]
qrcode-rust = { git = "https://github.com/veaba/wasm-qrcode", package = "qrcode-rust" }
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
    let mut qr = QRCode::new();
    
    // 生成 QRCode
    qr.make_code("https://github.com/veaba/wasm-qrcode");
    
    // 获取 SVG
    let svg = qr.get_svg();
    println!("{}", svg);
}
```

### 指定纠错级别

```rust
use qrcode_rust::{QRCode, QRErrorCorrectLevel};

fn main() {
    let mut qr = QRCode::new();
    
    // 设置纠错级别
    qr.options.correct_level = QRErrorCorrectLevel::H;
    qr.make_code("https://github.com/veaba/wasm-qrcode");
    
    let svg = qr.get_svg();
    println!("{}", svg);
}
```

## 输出格式

### SVG 输出

```rust
use qrcode_rust::{QRCode, QRErrorCorrectLevel};

fn main() {
    let mut qr = QRCode::new();
    qr.make_code("https://github.com/veaba/wasm-qrcode");
    
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
    let mut qr = QRCode::new();
    qr.make_code("https://github.com/veaba/wasm-qrcode");
    
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
    let mut qr = QRCode::new();
    qr.make_code("Hello, Rust!");
    
    render_to_console(&qr);
}
```

## 批量生成

### 顺序生成

```rust
use qrcode_rust::QRCode;

fn main() {
    let texts: Vec<String> = (0..100)
        .map(|i| format!("https://github.com/veaba/wasm-qrcode/{}", i))
        .collect();
    
    let mut results = Vec::new();
    
    for text in &texts {
        let mut qr = QRCode::new();
        qr.make_code(text);
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
        .map(|i| format!("https://github.com/veaba/wasm-qrcode/{}", i))
        .collect();
    
    // 并行生成
    let results: Vec<String> = texts
        .par_iter()
        .map(|text| {
            let mut qr = QRCode::new();
            qr.make_code(text);
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
    let text = query.text.clone().unwrap_or_else(|| "https://github.com/veaba/wasm-qrcode".to_string());
    
    let mut qr = QRCode::new();
    qr.options.correct_level = QRErrorCorrectLevel::H;
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
use qrcode_rust::{QRCode, QRErrorCorrectLevel};
use serde::Deserialize;

#[derive(Deserialize)]
struct QRCodeParams {
    text: Option<String>,
}

async fn generate_qrcode(Query(params): Query<QRCodeParams>) -> Html<String> {
    let text = params.text.unwrap_or_else(|| "https://github.com/veaba/wasm-qrcode".to_string());
    
    let mut qr = QRCode::new();
    qr.options.correct_level = QRErrorCorrectLevel::H;
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
    
    println!("Server running on http://127.0.0.1:3000");
    axum::serve(listener, app).await.unwrap();
}
```

## 自定义选项

### 颜色配置

```rust
use qrcode_rust::{QRCode, QRCodeOptions, QRErrorCorrectLevel};

fn main() {
    let mut qr = QRCode::new();
    
    // 自定义颜色
    qr.options.color_dark = "#FF0000".to_string();
    qr.options.color_light = "#FFFFFF".to_string();
    qr.options.correct_level = QRErrorCorrectLevel::H;
    
    qr.make_code("https://github.com/veaba/wasm-qrcode");
    
    let svg = qr.get_svg();
    std::fs::write("red-qrcode.svg", svg).unwrap();
}
```

## 性能优化

### 复用实例

```rust
use qrcode_rust::QRCode;

fn main() {
    // 复用同一个实例（注意：make_code 会重置状态）
    let mut qr = QRCode::new();
    
    let texts = vec![
        "https://github.com/veaba/wasm-qrcode/1",
        "https://github.com/veaba/wasm-qrcode/2",
        "https://github.com/veaba/wasm-qrcode/3",
    ];
    
    for text in &texts {
        qr.make_code(text);
        let _svg = qr.get_svg();
        // 处理 svg...
    }
}
```

### 使用线程池

```rust
use qrcode_rust::QRCode;
use std::thread;
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();
    let texts: Vec<String> = (0..100)
        .map(|i| format!("https://github.com/veaba/wasm-qrcode/{}", i))
        .collect();
    
    // 创建工作线程
    let handles: Vec<_> = texts
        .chunks(10)
        .map(|chunk| {
            let tx = tx.clone();
            let chunk = chunk.to_vec();
            
            thread::spawn(move || {
                for text in chunk {
                    let mut qr = QRCode::new();
                    qr.make_code(&text);
                    tx.send(qr.get_svg()).unwrap();
                }
            })
        })
        .collect();
    
    // 收集结果
    drop(tx);
    let mut count = 0;
    for _ in rx {
        count += 1;
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
    
    println!("Generated {} QR codes", count);
}
```

## 基准测试

运行内置基准测试：

```bash
cd packages/qrcode-rust
cargo bench
```

预期结果：

```
single_generation     time:   [14.302 µs 14.338 µs 14.380 µs]
batch_generation_100  time:   [1.1223 ms 1.1253 ms 1.1287 ms]
svg_generation        time:   [61.142 µs 61.278 µs 61.429 µs]
error_level_L         time:   [7.3545 µs 7.3735 µs 7.3941 µs]
```

## 与 WASM/JS 版本的性能对比

| 运行时 | 单条生成 | 批量 1000 条 | 相对速度 |
|--------|---------|-------------|---------|
| Rust 原生 | ~70,000 ops/s | ~80,000 ops/s | 1x (基准) |
| WASM (浏览器) | ~15,000 ops/s | ~6,000 ops/s | 4.7x 慢 |
| Bun | ~15,000 ops/s | ~17,000 ops/s | 4.7x 慢 |
| Node.js | ~10,000 ops/s | ~6,000 ops/s | 7x 慢 |

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
| `QRCode::new()` | 创建实例 | `QRCode` |
| `make_code(text)` | 生成 QRCode | `()` |
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
