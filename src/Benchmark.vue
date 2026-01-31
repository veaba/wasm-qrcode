<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// ========== 类型定义 ==========
interface BenchmarkResult {
  name: string;
  ops: number;
  time: number;
  avgTime: number;
  memoryDelta?: number;
}

interface BenchmarkSuite {
  name: string;
  description: string;
  results: BenchmarkResult[];
  timestamp: string;
  nodeVersion?: string;
  bunVersion?: string;
}

// ========== 前端包导入 ==========
// @ts-ignore
import init, { QRCodeWasm } from '@veaba/qrcode-wasm'
// @ts-ignore
import { QRCodeCore as QRCodeJS, QRErrorCorrectLevel } from '@veaba/shared'

// ========== 状态管理 ==========
const isLoading = ref(true)
const activeTab = ref<'frontend' | 'backend' | 'comparison'>('frontend')

// 后端测试结果
const nodeData = ref<BenchmarkSuite | null>(null)
const bunData = ref<BenchmarkSuite | null>(null)
const rustData = ref<BenchmarkSuite | null>(null)

// 测试配置
const testCount = ref(1000)
const selectedTestType = ref<'single' | 'batch' | 'all'>('all')

// 前端测试结果
const frontendResults = ref<{
  wasm?: BenchmarkResult;
  wasmBatch?: BenchmarkResult;
  jsPerf?: BenchmarkResult;
  jsCache?: BenchmarkResult;
  jsOriginal?: BenchmarkResult;
  jsBatch?: BenchmarkResult;
} | null>(null)
const isTestingFrontend = ref(false)
const testProgress = ref(0)

// ========== 初始化 ==========
onMounted(async () => {
  await init()

  // 加载后端测试结果
  try {
    const [nodeRes, bunRes, rustRes] = await Promise.all([
      fetch('/benchmark_node_result.json').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/benchmark_bun_result.json').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/benchmark_rust_result.json').then(r => r.ok ? r.json() : null).catch(() => null)
    ])
    nodeData.value = nodeRes
    bunData.value = bunRes
    rustData.value = rustRes
  } catch (e) {
    console.error('加载基准测试结果失败:', e)
  } finally {
    isLoading.value = false
  }
})

// ========== 计算属性 ==========
const hasBackendData = computed(() => {
  return nodeData.value || bunData.value || rustData.value
})

const bestFrontendResult = computed(() => {
  if (!frontendResults.value) return null
  
  const results = [
    { name: 'WASM 单条', ops: frontendResults.value.wasm?.ops || 0 },
    { name: 'WASM 批量', ops: frontendResults.value.wasmBatch?.ops || 0 },
    { name: 'JS 优化', ops: frontendResults.value.jsPerf?.ops || 0 },
    { name: 'JS 缓存', ops: frontendResults.value.jsCache?.ops || 0 },
    { name: 'JS 原始', ops: frontendResults.value.jsOriginal?.ops || 0 },
    { name: 'JS 批量', ops: frontendResults.value.jsBatch?.ops || 0 },
  ]
  
  return results.reduce((best, current) => current.ops > best.ops ? current : best)
})

const backendComparison = computed(() => {
  const comparisons: { name: string; node?: number; bun?: number; rust?: number; unit: string }[] = []
  
  // 单条生成对比
  const nodeSingle = nodeData.value?.results?.find(r => r.name?.includes('单条生成 (medium)'))
  const bunSingle = bunData.value?.results?.find(r => r.name?.includes('单条生成 (medium)'))
  const rustSingle = rustData.value?.results?.find(r => r.name?.includes('单条生成'))
  
  if (nodeSingle || bunSingle || rustSingle) {
    comparisons.push({
      name: '单条生成 (ops/s)',
      node: nodeSingle?.ops,
      bun: bunSingle?.ops,
      rust: rustSingle?.ops,
      unit: 'ops/s'
    })
  }
  
  // 批量生成对比
  const nodeBatch = nodeData.value?.results?.find(r => r.name?.includes('批量生成 (1000'))
  const bunBatch = bunData.value?.results?.find(r => r.name?.includes('批量生成 (1000'))
  const rustBatch = rustData.value?.results?.find(r => r.name?.includes('批量生成'))
  
  if (nodeBatch || bunBatch || rustBatch) {
    comparisons.push({
      name: '批量生成 (ops/s)',
      node: nodeBatch?.ops,
      bun: bunBatch?.ops,
      rust: rustBatch?.ops,
      unit: 'ops/s'
    })
  }
  
  return comparisons
})

// ========== 前端基准测试 ==========
async function runFrontendBenchmarks() {
  isTestingFrontend.value = true
  frontendResults.value = null
  testProgress.value = 0

  const text = 'https://github.com/veaba/wasm-qrcode'
  const count = testCount.value
  const texts = Array.from({ length: count }, (_, i) => `${text}/test${i}`)

  // 预热
  for (let i = 0; i < 5; i++) {
    const gen = new QRCodeWasm()
    gen.make_code(text)
    gen.get_svg()
    new QRCodeJS(text, QRErrorCorrectLevel.H).toSVG()
  }

  const results: any = {}

  // 1. WASM 单条测试
  if (selectedTestType.value === 'single' || selectedTestType.value === 'all') {
    testProgress.value = 10
    const wasmStart = performance.now()
    for (let i = 0; i < count; i++) {
      const gen = new QRCodeWasm()
      gen.make_code(texts[i])
      gen.get_svg()
    }
    results.wasm = {
      name: 'WASM 单条生成',
      ops: Math.round(count / ((performance.now() - wasmStart) / 1000)),
      time: performance.now() - wasmStart,
      avgTime: (performance.now() - wasmStart) / count,
    }
  }

  // 2. WASM 批量测试
  if (selectedTestType.value === 'batch' || selectedTestType.value === 'all') {
    testProgress.value = 25
    const wasmBatchStart = performance.now()
    for (const t of texts) {
      const gen = new QRCodeWasm()
      gen.make_code(t)
      gen.get_svg()
    }
    results.wasmBatch = {
      name: 'WASM 批量生成',
      ops: Math.round(count / ((performance.now() - wasmBatchStart) / 1000)),
      time: performance.now() - wasmBatchStart,
      avgTime: (performance.now() - wasmBatchStart) / count,
    }
  }

  // 3. JS 优化单条测试
  if (selectedTestType.value === 'single' || selectedTestType.value === 'all') {
    testProgress.value = 40
    const jsPerfStart = performance.now()
    for (let i = 0; i < count; i++) {
      const qr = new QRCodeJS(texts[i], QRErrorCorrectLevel.H)
      qr.toSVG()
    }
    results.jsPerf = {
      name: 'JS 优化单条',
      ops: Math.round(count / ((performance.now() - jsPerfStart) / 1000)),
      time: performance.now() - jsPerfStart,
      avgTime: (performance.now() - jsPerfStart) / count,
    }
  }

  // 4. JS 缓存测试
  if (selectedTestType.value === 'single' || selectedTestType.value === 'all') {
    testProgress.value = 55
    const cache = new Map()
    // 填充缓存
    for (let i = 0; i < Math.min(count, 100); i++) {
      const qr = new QRCodeJS(texts[i], QRErrorCorrectLevel.H)
      cache.set(texts[i], qr.toSVG())
    }
    
    const cacheStart = performance.now()
    for (let i = 0; i < count; i++) {
      const key = texts[Math.floor(Math.random() * Math.min(count, 100))]
      if (!cache.has(key)) {
        const qr = new QRCodeJS(key, QRErrorCorrectLevel.H)
        qr.toSVG()
      }
    }
    results.jsCache = {
      name: 'JS 缓存',
      ops: Math.round(count / ((performance.now() - cacheStart) / 1000)),
      time: performance.now() - cacheStart,
      avgTime: (performance.now() - cacheStart) / count,
    }
  }

  // 5. JS 原始测试
  if (selectedTestType.value === 'single' || selectedTestType.value === 'all') {
    testProgress.value = 70
    const jsOriginalStart = performance.now()
    for (let i = 0; i < count; i++) {
      const qr = new QRCodeJS(texts[i], QRErrorCorrectLevel.H)
      qr.toSVG()
    }
    results.jsOriginal = {
      name: 'JS 原始',
      ops: Math.round(count / ((performance.now() - jsOriginalStart) / 1000)),
      time: performance.now() - jsOriginalStart,
      avgTime: (performance.now() - jsOriginalStart) / count,
    }
  }

  // 6. JS 批量测试
  if (selectedTestType.value === 'batch' || selectedTestType.value === 'all') {
    testProgress.value = 85
    const jsBatchStart = performance.now()
    for (const t of texts) {
      const qr = new QRCodeJS(t, QRErrorCorrectLevel.H)
      qr.toSVG()
    }
    results.jsBatch = {
      name: 'JS 批量',
      ops: Math.round(count / ((performance.now() - jsBatchStart) / 1000)),
      time: performance.now() - jsBatchStart,
      avgTime: (performance.now() - jsBatchStart) / count,
    }
  }

  testProgress.value = 100
  frontendResults.value = results
  isTestingFrontend.value = false
}

// ========== 辅助函数 ==========
function getRatio(ops1: number, ops2: number): string {
  if (!ops1 || !ops2) return '-'
  const ratio = ops1 / ops2
  return ratio.toFixed(2) + 'x'
}

function getPerformanceClass(ops: number, maxOps: number): string {
  const ratio = ops / maxOps
  if (ratio >= 0.9) return 'excellent'
  if (ratio >= 0.7) return 'good'
  if (ratio >= 0.5) return 'average'
  return 'poor'
}

function formatNumber(num: number): string {
  if (!num) return '-'
  return num.toLocaleString()
}

function formatTime(ms: number): string {
  if (!ms) return '-'
  if (ms < 1) return (ms * 1000).toFixed(2) + ' μs'
  if (ms < 1000) return ms.toFixed(2) + ' ms'
  return (ms / 1000).toFixed(2) + ' s'
}

function getWinnerIcon(winner: string): string {
  switch (winner) {
    case 'Node.js': return '🟢'
    case 'Bun': return '🥟'
    case 'Rust': return '🦀'
    default: return '🏆'
  }
}

function getMaxOps(item: { node?: number; bun?: number; rust?: number }): number {
  return Math.max(item.node || 0, item.bun || 0, item.rust || 0)
}
</script>

<template>
  <div class="benchmark-container">
    <h1>🏁 QRCode 性能基准测试</h1>
    <p class="subtitle">前端 (浏览器) + 后端 (Node/Bun/Rust) 全面对比</p>

    <!-- 标签切换 -->
    <div class="tab-nav">
      <button 
        :class="['tab-btn', { active: activeTab === 'frontend' }]"
        @click="activeTab = 'frontend'"
      >
        🌐 前端测试
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'backend' }]"
        @click="activeTab = 'backend'"
      >
        ⚡ 后端测试
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'comparison' }]"
        @click="activeTab = 'comparison'"
        :disabled="backendComparison.length === 0"
      >
        📊 跨端对比
      </button>
    </div>

    <!-- 前端基准测试区域 -->
    <div v-if="activeTab === 'frontend'" class="test-section">
      <h3>🌐 前端基准测试 (浏览器维度)</h3>
      
      <div class="test-config">
        <div class="config-item">
          <label>测试次数:</label>
          <input v-model.number="testCount" type="number" min="100" max="10000" step="100" :disabled="isTestingFrontend" />
        </div>
        <div class="config-item">
          <label>测试类型:</label>
          <select v-model="selectedTestType" :disabled="isTestingFrontend">
            <option value="all">全部</option>
            <option value="single">单条生成</option>
            <option value="batch">批量生成</option>
          </select>
        </div>
        <button @click="runFrontendBenchmarks" :disabled="isTestingFrontend" class="test-btn">
          {{ isTestingFrontend ? '⏳ 测试中...' : '🚀 开始测试' }}
        </button>
      </div>

      <!-- 进度条 -->
      <div v-if="isTestingFrontend" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: testProgress + '%' }"></div>
        </div>
        <span class="progress-text">{{ testProgress }}%</span>
      </div>

      <div v-if="frontendResults" class="frontend-results">
        <h4>📊 前端测试结果 ({{ testCount }} 次)</h4>

        <!-- 最佳性能 -->
        <div v-if="bestFrontendResult && bestFrontendResult.ops > 0" class="best-performance">
          🏆 最佳性能: <strong>{{ bestFrontendResult.name }}</strong>
          <span class="ops">{{ formatNumber(bestFrontendResult.ops) }} ops/s</span>
        </div>

        <!-- 前端包对比表 -->
        <div class="comparison-table">
          <h5>📦 前端包对比</h5>
          <table>
            <thead>
              <tr>
                <th>包名</th>
                <th>描述</th>
                <th>耗时</th>
                <th>吞吐量</th>
                <th>单次耗时</th>
                <th>性能评级</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="frontendResults.wasm" :class="['row-wasm', getPerformanceClass(frontendResults.wasm.ops, bestFrontendResult?.ops || 1)]">
                <td><strong>@veaba/qrcode-wasm</strong></td>
                <td>Rust WASM 单条</td>
                <td>{{ formatTime(frontendResults.wasm.time) }}</td>
                <td class="ops-cell">{{ formatNumber(frontendResults.wasm.ops) }} ops/s</td>
                <td>{{ formatTime(frontendResults.wasm.avgTime) }}</td>
                <td><span class="badge" :class="getPerformanceClass(frontendResults.wasm.ops, bestFrontendResult?.ops || 1)">{{ getPerformanceClass(frontendResults.wasm.ops, bestFrontendResult?.ops || 1) }}</span></td>
              </tr>
              <tr v-if="frontendResults.wasmBatch" :class="['row-wasm-batch', getPerformanceClass(frontendResults.wasmBatch.ops, bestFrontendResult?.ops || 1)]">
                <td><strong>@veaba/qrcode-wasm</strong></td>
                <td>Rust WASM 批量</td>
                <td>{{ formatTime(frontendResults.wasmBatch.time) }}</td>
                <td class="ops-cell">{{ formatNumber(frontendResults.wasmBatch.ops) }} ops/s</td>
                <td>{{ formatTime(frontendResults.wasmBatch.avgTime) }}</td>
                <td><span class="badge" :class="getPerformanceClass(frontendResults.wasmBatch.ops, bestFrontendResult?.ops || 1)">{{ getPerformanceClass(frontendResults.wasmBatch.ops, bestFrontendResult?.ops || 1) }}</span></td>
              </tr>
              <tr v-if="frontendResults.jsPerf" :class="['row-perf', getPerformanceClass(frontendResults.jsPerf.ops, bestFrontendResult?.ops || 1)]">
                <td><strong>@veaba/qrcodejs</strong></td>
                <td>JS 单条生成</td>
                <td>{{ formatTime(frontendResults.jsPerf.time) }}</td>
                <td class="ops-cell">{{ formatNumber(frontendResults.jsPerf.ops) }} ops/s</td>
                <td>{{ formatTime(frontendResults.jsPerf.avgTime) }}</td>
                <td><span class="badge" :class="getPerformanceClass(frontendResults.jsPerf.ops, bestFrontendResult?.ops || 1)">{{ getPerformanceClass(frontendResults.jsPerf.ops, bestFrontendResult?.ops || 1) }}</span></td>
              </tr>
              <tr v-if="frontendResults.jsCache" :class="['row-cache', getPerformanceClass(frontendResults.jsCache.ops, bestFrontendResult?.ops || 1)]">
                <td><strong>@veaba/shared (cache)</strong></td>
                <td>带缓存的 JS 生成</td>
                <td>{{ formatTime(frontendResults.jsCache.time) }}</td>
                <td class="ops-cell">{{ formatNumber(frontendResults.jsCache.ops) }} ops/s</td>
                <td>{{ formatTime(frontendResults.jsCache.avgTime) }}</td>
                <td><span class="badge" :class="getPerformanceClass(frontendResults.jsCache.ops, bestFrontendResult?.ops || 1)">{{ getPerformanceClass(frontendResults.jsCache.ops, bestFrontendResult?.ops || 1) }}</span></td>
              </tr>
              <tr v-if="frontendResults.jsOriginal" :class="['row-old', getPerformanceClass(frontendResults.jsOriginal.ops, bestFrontendResult?.ops || 1)]">
                <td><strong>@veaba/qrcodejs</strong></td>
                <td>JS 单条生成 (重复)</td>
                <td>{{ formatTime(frontendResults.jsOriginal.time) }}</td>
                <td class="ops-cell">{{ formatNumber(frontendResults.jsOriginal.ops) }} ops/s</td>
                <td>{{ formatTime(frontendResults.jsOriginal.avgTime) }}</td>
                <td><span class="badge" :class="getPerformanceClass(frontendResults.jsOriginal.ops, bestFrontendResult?.ops || 1)">{{ getPerformanceClass(frontendResults.jsOriginal.ops, bestFrontendResult?.ops || 1) }}</span></td>
              </tr>
              <tr v-if="frontendResults.jsBatch" :class="['row-js-batch', getPerformanceClass(frontendResults.jsBatch.ops, bestFrontendResult?.ops || 1)]">
                <td><strong>@veaba/qrcodejs</strong></td>
                <td>JS 批量</td>
                <td>{{ formatTime(frontendResults.jsBatch.time) }}</td>
                <td class="ops-cell">{{ formatNumber(frontendResults.jsBatch.ops) }} ops/s</td>
                <td>{{ formatTime(frontendResults.jsBatch.avgTime) }}</td>
                <td><span class="badge" :class="getPerformanceClass(frontendResults.jsBatch.ops, bestFrontendResult?.ops || 1)">{{ getPerformanceClass(frontendResults.jsBatch.ops, bestFrontendResult?.ops || 1) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 性能对比 -->
        <div class="performance-comparison">
          <h5>⚖️ 性能对比</h5>
          <div class="comparison-grid">
            <div v-if="frontendResults.wasm && frontendResults.jsOriginal" class="comparison-item">
              <span class="label">WASM vs 原始 JS:</span>
              <span class="ratio" :class="{ faster: frontendResults.wasm.ops > frontendResults.jsOriginal.ops }">
                {{ getRatio(frontendResults.wasm.ops, frontendResults.jsOriginal.ops) }}
              </span>
            </div>
            <div v-if="frontendResults.jsCache && frontendResults.jsPerf" class="comparison-item">
              <span class="label">缓存 vs 无缓存:</span>
              <span class="ratio" :class="{ faster: frontendResults.jsCache.ops > frontendResults.jsPerf.ops }">
                {{ getRatio(frontendResults.jsCache.ops, frontendResults.jsPerf.ops) }}
              </span>
            </div>
            <div v-if="frontendResults.wasmBatch && frontendResults.jsBatch" class="comparison-item">
              <span class="label">WASM 批量 vs JS 批量:</span>
              <span class="ratio" :class="{ faster: frontendResults.wasmBatch.ops > frontendResults.jsBatch.ops }">
                {{ getRatio(frontendResults.wasmBatch.ops, frontendResults.jsBatch.ops) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 后端基准测试区域 -->
    <div v-if="activeTab === 'backend'" class="backend-section">
      <h3>⚡ 后端基准测试 (Node / Bun / Rust)</h3>

      <div v-if="!hasBackendData" class="no-data">
        <p>暂无后端测试数据。请运行后端基准测试：</p>
        <code>cd packages/qrcode-node && node benchmark/index.js</code>
        <code>cd packages/qrcode-ts && bun benchmark/index.ts</code>
        <code>cd packages/qrcode-rust && cargo bench</code>
        <p class="hint">将结果复制到 public/ 目录后，刷新页面即可查看结果</p>
      </div>

      <div v-else class="backend-grid">
        <!-- Node.js -->
        <div class="backend-card node" v-if="nodeData">
          <div class="card-header">
            <h4>🟢 Node.js</h4>
            <span class="version">{{ nodeData.nodeVersion || 'unknown' }}</span>
          </div>
          <div class="card-meta">
            <span class="timestamp">{{ new Date(nodeData.timestamp).toLocaleString() }}</span>
          </div>
          <div class="ops-list">
            <div v-for="result in nodeData.results?.slice(0, 6)" :key="result.name" class="ops-item">
              <span class="label">{{ result.name }}:</span>
              <span class="value">{{ formatNumber(result.ops) }} ops/s</span>
            </div>
          </div>
        </div>

        <!-- Bun -->
        <div class="backend-card bun" v-if="bunData">
          <div class="card-header">
            <h4>🥟 Bun</h4>
            <span class="version">{{ bunData.bunVersion || 'unknown' }}</span>
          </div>
          <div class="card-meta">
            <span class="timestamp">{{ new Date(bunData.timestamp).toLocaleString() }}</span>
          </div>
          <div class="ops-list">
            <div v-for="result in bunData.results?.slice(0, 6)" :key="result.name" class="ops-item">
              <span class="label">{{ result.name }}:</span>
              <span class="value">{{ formatNumber(result.ops) }} ops/s</span>
            </div>
          </div>
        </div>

        <!-- Rust -->
        <div class="backend-card rust" v-if="rustData">
          <div class="card-header">
            <h4>🦀 Rust</h4>
            <span class="version">native</span>
          </div>
          <div class="card-meta">
            <span class="timestamp">{{ new Date(rustData.timestamp).toLocaleString() }}</span>
          </div>
          <div class="ops-list">
            <div v-for="result in rustData.results?.slice(0, 6)" :key="result.name" class="ops-item">
              <span class="label">{{ result.name }}:</span>
              <span class="value">{{ formatNumber(result.ops) }} ops/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 跨端对比区域 -->
    <div v-if="activeTab === 'comparison'" class="comparison-section">
      <h3>📊 跨后端对比</h3>

      <div v-if="backendComparison.length === 0" class="no-data">
        <p>暂无跨端对比数据。请先运行后端基准测试：</p>
        <code>cd packages/qrcode-node && node benchmark/index.js</code>
        <code>cd packages/qrcode-ts && bun benchmark/index.ts</code>
        <code>cd packages/qrcode-rust && cargo bench</code>
      </div>

      <div v-else class="cross-backend-comparison">
        <!-- 对比表格 -->
        <div class="comparison-table">
          <table>
            <thead>
              <tr>
                <th>指标</th>
                <th v-if="nodeData" class="node-header">🟢 Node.js</th>
                <th v-if="bunData" class="bun-header">🥟 Bun</th>
                <th v-if="rustData" class="rust-header">🦀 Rust</th>
                <th>胜出</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in backendComparison" :key="item.name">
                <td>{{ item.name }}</td>
                <td v-if="nodeData" :class="{ winner: item.node && item.node === getMaxOps(item) }">
                  {{ formatNumber(item.node) }}
                </td>
                <td v-if="bunData" :class="{ winner: item.bun && item.bun === getMaxOps(item) }">
                  {{ formatNumber(item.bun) }}
                </td>
                <td v-if="rustData" :class="{ winner: item.rust && item.rust === getMaxOps(item) }">
                  {{ formatNumber(item.rust) }}
                </td>
                <td class="winner-cell">
                  <span v-if="getMaxOps(item) > 0" class="winner-badge">
                    {{ item.node === getMaxOps(item) ? '🟢' : item.bun === getMaxOps(item) ? '🥟' : '🦀' }}
                    {{ item.node === getMaxOps(item) ? 'Node.js' : item.bun === getMaxOps(item) ? 'Bun' : 'Rust' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 性能图表 -->
        <div class="performance-chart">
          <h5>📈 性能可视化 (单条生成)</h5>
          <div class="chart-container">
            <div v-if="nodeData" class="chart-bar node-bar" 
                 :style="{ width: Math.min(100, ((backendComparison[0]?.node || 0) / Math.max(backendComparison[0]?.node || 1, backendComparison[0]?.bun || 1, backendComparison[0]?.rust || 1)) * 100) + '%' }">
              <span class="bar-label">Node.js</span>
              <span class="bar-value">{{ formatNumber(backendComparison[0]?.node) }}</span>
            </div>
            <div v-if="bunData" class="chart-bar bun-bar"
                 :style="{ width: Math.min(100, ((backendComparison[0]?.bun || 0) / Math.max(backendComparison[0]?.node || 1, backendComparison[0]?.bun || 1, backendComparison[0]?.rust || 1)) * 100) + '%' }">
              <span class="bar-label">Bun</span>
              <span class="bar-value">{{ formatNumber(backendComparison[0]?.bun) }}</span>
            </div>
            <div v-if="rustData" class="chart-bar rust-bar"
                 :style="{ width: Math.min(100, ((backendComparison[0]?.rust || 0) / Math.max(backendComparison[0]?.node || 1, backendComparison[0]?.bun || 1, backendComparison[0]?.rust || 1)) * 100) + '%' }">
              <span class="bar-label">Rust</span>
              <span class="bar-value">{{ formatNumber(backendComparison[0]?.rust) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用建议 -->
    <div class="tips-section">
      <h3>💡 使用建议</h3>
      <div class="tips-grid">
        <div class="tip">
          <h4>🌐 前端 (浏览器)</h4>
          <ul>
            <li><strong>@veaba/qrcode-wasm:</strong> Rust WASM 版本，性能最佳，推荐生产环境使用</li>
            <li><strong>@veaba/qrcodejs:</strong> 纯 JavaScript 版本，无需 WASM，兼容性好</li>
            <li><strong>@veaba/shared:</strong> 共享核心库，包含缓存和性能优化工具</li>
          </ul>
        </div>
        <div class="tip">
          <h4>🖥️ 后端 (服务端)</h4>
          <ul>
            <li><strong>@veaba/qrcode-node:</strong> Node.js 环境，支持 SVG/PNG 输出</li>
            <li><strong>@veaba/qrcode-ts:</strong> Bun 运行时，启动快速，适合边缘计算</li>
            <li><strong>@veaba/qrcode-rust:</strong> 原生 Rust 版本，最高性能，内存安全</li>
          </ul>
        </div>
        <div class="tip">
          <h4>📦 架构说明</h4>
          <ul>
            <li><strong>统一 API:</strong> 所有包使用相同的接口设计，易于切换</li>
            <li><strong>@veaba/shared:</strong> 单一数据源，类型定义和核心逻辑共享</li>
            <li><strong>缓存系统:</strong> LRU 缓存实现，重复文本场景性能提升显著</li>
          </ul>
        </div>
        <div class="tip">
          <h4>⚡ 性能对比</h4>
          <ul>
            <li><strong>WASM vs JS:</strong> WASM 通常快 2-5 倍，适合高频生成场景</li>
            <li><strong>Bun vs Node:</strong> Bun 启动更快，单条性能提升约 30-50%</li>
            <li><strong>缓存优化:</strong> 重复文本使用缓存可提升 10-100 倍性能</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="back-link">
      <router-link to="/">← 返回主页</router-link>
    </div>
  </div>
</template>

<style scoped>
.benchmark-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

h1 {
  text-align: center;
  color: white;
  margin-bottom: 8px;
  font-size: 2.5rem;
}

.subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  font-size: 1.1rem;
}

/* 标签导航 */
.tab-nav {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.tab-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.tab-btn.active {
  background: white;
  color: #667eea;
}

.tab-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 测试区域 */
.test-section,
.backend-section,
.comparison-section,
.tips-section {
  background: white;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.test-section h3,
.backend-section h3,
.comparison-section h3,
.tips-section h3 {
  margin-top: 0;
  color: #333;
  margin-bottom: 16px;
}

/* 测试配置 */
.test-config {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-item label {
  font-weight: 600;
  color: #555;
}

.config-item input,
.config-item select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.test-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.test-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.test-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 进度条 */
.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  min-width: 40px;
}

/* 前端结果 */
.frontend-results h4,
.comparison-table h5 {
  color: #333;
  margin-bottom: 16px;
}

.best-performance {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  color: #166534;
  font-weight: 600;
}

.best-performance .ops {
  margin-left: 12px;
  padding: 4px 12px;
  background: #22c55e;
  color: white;
  border-radius: 20px;
  font-size: 14px;
}

/* 对比表格 */
.comparison-table table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.comparison-table th,
.comparison-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.comparison-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #555;
}

.comparison-table .ops-cell {
  font-weight: 700;
  color: #667eea;
}

/* 行样式 */
.row-wasm { background: #fff5f5; }
.row-wasm-batch { background: #f5f3ff; }
.row-perf { background: #fffbeb; }
.row-cache { background: #f0fdf4; }
.row-old { background: #eff6ff; }
.row-js-batch { background: #fefce8; }

/* 性能评级 */
.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.excellent {
  background: #dcfce7;
  color: #166534;
}

.badge.good {
  background: #dbeafe;
  color: #1e40af;
}

.badge.average {
  background: #fef3c7;
  color: #92400e;
}

.badge.poor {
  background: #fee2e2;
  color: #991b1b;
}

/* 性能对比 */
.performance-comparison {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 10px;
  margin-top: 20px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.comparison-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.comparison-item .label {
  color: #666;
  font-size: 14px;
}

.comparison-item .ratio {
  font-weight: 700;
  color: #333;
  padding: 4px 10px;
  border-radius: 12px;
  background: #e5e7eb;
}

.comparison-item .ratio.faster {
  background: #dcfce7;
  color: #166534;
}

/* 后端网格 */
.backend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.backend-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: transform 0.3s, box-shadow 0.3s;
}

.backend-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.backend-card.node {
  border-color: #22c55e;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.backend-card.rust {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.backend-card.bun {
  border-color: #f97316;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.backend-card h4 {
  margin: 0;
  color: #333;
}

.version {
  font-size: 12px;
  color: #666;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
}

.card-meta {
  margin-bottom: 16px;
}

.timestamp {
  font-size: 12px;
  color: #888;
}

.ops-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ops-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
}

.ops-item .label {
  color: #666;
}

.ops-item .value {
  font-weight: 600;
  color: #333;
}

/* 跨端对比 */
.cross-backend-comparison {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.node-header { background: #dcfce7 !important; color: #166534 !important; }
.bun-header { background: #ffedd5 !important; color: #9a3412 !important; }
.rust-header { background: #fee2e2 !important; color: #991b1b !important; }

.winner {
  font-weight: 700;
  background: #dcfce7 !important;
}

.winner-cell {
  text-align: center;
}

.winner-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* 性能图表 */
.performance-chart {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  min-width: 120px;
  transition: width 0.5s ease;
  white-space: nowrap;
}

.node-bar {
  background: linear-gradient(90deg, #22c55e, #16a34a);
  color: white;
}

.bun-bar {
  background: linear-gradient(90deg, #f97316, #ea580c);
  color: white;
}

.rust-bar {
  background: linear-gradient(90deg, #ef4444, #dc2626);
  color: white;
}

.bar-label {
  font-weight: 600;
}

.bar-value {
  font-weight: 700;
}

/* 无数据提示 */
.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
}

.no-data code {
  display: block;
  margin: 8px 0;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 6px;
  font-family: monospace;
  font-size: 14px;
}

.no-data .hint {
  margin-top: 12px;
  color: #888;
  font-size: 14px;
}

/* 使用建议 */
.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.tip {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.tip h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.tip ul {
  margin: 0;
  padding-left: 18px;
}

.tip li {
  margin-bottom: 8px;
  color: #555;
  font-size: 14px;
  line-height: 1.5;
}

/* 返回链接 */
.back-link {
  text-align: center;
  margin-top: 20px;
}

.back-link a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  transition: background 0.3s;
  display: inline-block;
}

.back-link a:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .tab-nav {
    flex-direction: column;
  }
  
  .test-config {
    flex-direction: column;
    align-items: stretch;
  }
  
  .config-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .comparison-grid {
    grid-template-columns: 1fr;
  }
  
  .tips-grid {
    grid-template-columns: 1fr;
  }
}
</style>
