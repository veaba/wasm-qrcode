<script setup lang='ts'>
import { ref, onMounted } from 'vue'
// @ts-ignore
import init, {
  version,
  QRCodeGenerator,
  generate_rounded_qrcode as wasmRounded,
  generate_qrcode_with_logo_area as wasmLogo,
  generate_gradient_qrcode as wasmGradient,
  generate_wechat_style_qrcode as wasmWechat,
  generate_douyin_style_qrcode as wasmDouyin,
  generate_alipay_style_qrcode as wasmAlipay,
  generate_xiaohongshu_style_qrcode as wasmXiaohongshu,
  generate_cyberpunk_style_qrcode as wasmCyberpunk,
  generate_retro_style_qrcode as wasmRetro,
  generate_minimal_style_qrcode as wasmMinimal,
} from '@veaba/qrcode-wasm'
// @ts-ignore
import {
  QRCodeCore as QRCodeJS,
  generateRoundedQRCode as jsRounded,
  generateQRCodeWithLogoArea as jsLogo,
  generateGradientQRCode as jsGradient,
  generateWechatStyleQRCode as jsWechat,
  generateDouyinStyleQRCode as jsDouyin,
  generateAlipayStyleQRCode as jsAlipay,
  generateXiaohongshuStyleQRCode as jsXiaohongshu,
  generateCyberpunkStyleQRCode as jsCyberpunk,
  generateRetroStyleQRCode as jsRetro,
  generateMinimalStyleQRCode as jsMinimal,
} from '@veaba/qrcode-shared'



const refVersion = ref('')
const refText = ref('https://github.com/veaba/wasm-qrcode')
const isLoaded = ref(false)

// WASM 版本数据
const wasmModuleCount = ref(0)
const wasmSvg = ref('')

// JS 版本数据
const jsModuleCount = ref(0)
const jsSvg = ref('')



const styles = ref([
  { name: '圆角样式', key: 'rounded', wasmFn: wasmRounded, jsFn: jsRounded },
  { name: '带 Logo 区域', key: 'logo', wasmFn: wasmLogo, jsFn: jsLogo },
  { name: '渐变样式', key: 'gradient', wasmFn: wasmGradient, jsFn: jsGradient },
  { name: '微信样式', key: 'wechat', wasmFn: wasmWechat, jsFn: jsWechat },
  { name: '抖音样式', key: 'douyin', wasmFn: wasmDouyin, jsFn: jsDouyin },
  { name: '支付宝样式', key: 'alipay', wasmFn: wasmAlipay, jsFn: jsAlipay },
  { name: '小红书样式', key: 'xiaohongshu', wasmFn: wasmXiaohongshu, jsFn: jsXiaohongshu },
  { name: '赛博朋克', key: 'cyberpunk', wasmFn: wasmCyberpunk, jsFn: jsCyberpunk },
  { name: '复古样式', key: 'retro', wasmFn: wasmRetro, jsFn: jsRetro },
  { name: '极简样式', key: 'minimal', wasmFn: wasmMinimal, jsFn: jsMinimal },
])

const wasmStyleSvgs = ref<Record<string, string>>({})
const jsStyleSvgs = ref<Record<string, string>>({})

// 批量生成
const wasmBatchSvgs = ref<string[]>([])
const jsBatchSvgs = ref<string[]>([])

const runWasm = async () => {
  try {
    await init()
    isLoaded.value = true
    refVersion.value = version()
    generateAllQR()
  } catch (e) {
    console.error('Failed to load WASM:', e)
  }
}

// 生成所有 QRCode
const generateAllQR = () => {
  generateWasmQR()
  generateJsQR()
  generateStyles()
  generateBatchQR()
}

// WASM 版本生成
const generateWasmQR = () => {
  if (!isLoaded.value) return
  try {
    const gen = new QRCodeGenerator()
    gen.generate(refText.value)
    wasmModuleCount.value = gen.get_module_count()
    wasmSvg.value = gen.get_svg()
  } catch (e) {
    console.error('Failed to generate WASM QRCode:', e)
  }
}

// JS 版本生成
const generateJsQR = () => {
  try {
    // QRErrorCorrectLevel.H = 2
    const qr = new QRCodeJS(refText.value, 2)
    jsModuleCount.value = qr.getModuleCount()
    jsSvg.value = qr.toSVG()
  } catch (e) {
    console.error('Failed to generate JS QRCode:', e)
  }
}

// 生成样式（WASM + JS）
const generateStyles = () => {
  const text = refText.value
  const size = 280

  styles.value.forEach((style: any) => {
    try {
      let wasmResult = ''
      let jsResult = ''

      if (style.key === 'rounded') {
        wasmResult = (style.wasmFn as (t: string, s: number, r: number) => string)(text, size, 8)
        jsResult = (style.jsFn as (t: string, s: number, r: number) => string)(text, size, 8)
      } else if (style.key === 'logo') {
        wasmResult = (style.wasmFn as (t: string, s: number, r: number) => string)(text, size, 0.2)
        jsResult = (style.jsFn as (t: string, s: number, r: number) => string)(text, size, 0.2)
      } else if (style.key === 'gradient') {
        wasmResult = (style.wasmFn as (t: string, s: number, c1: string, c2: string) => string)(text, size, '#667eea', '#764ba2')
        jsResult = (style.jsFn as (t: string, s: number, c1: string, c2: string) => string)(text, size, '#667eea', '#764ba2')
      } else {
        wasmResult = (style.wasmFn as (t: string, s: number) => string)(text, size)
        jsResult = (style.jsFn as (t: string, s: number) => string)(text, size)
      }

      wasmStyleSvgs.value[style.key] = wasmResult
      jsStyleSvgs.value[style.key] = jsResult
    } catch (e) {
      console.error(`Failed to generate ${style.name}:`, e)
    }
  })
}

// 批量生成对比
const generateBatchQR = () => {
  const texts = Array.from({ length: 6 }, (_, i) => `${refText.value}/page${i}`)

  // WASM 批量
  if (isLoaded.value) {
    try {
      const gen = new QRCodeGenerator()
      wasmBatchSvgs.value = gen.generate_batch(texts)
    } catch (e) {
      console.error('Failed to generate WASM batch:', e)
    }
  }

  // JS 批量
  try {
    jsBatchSvgs.value = texts.map(t => {
      // QRErrorCorrectLevel.H = 2
      const qr = new QRCodeJS(t, 2)
      return qr.toSVG()
    })
  } catch (e) {
    console.error('Failed to generate JS batch:', e)
  }
}

const updateQRCode = () => {
  generateAllQR()
}

onMounted(() => {
  runWasm()
})
</script>

<template>
  <div class="container">
    <h1>🚀 QRCode 双引擎对比</h1>
    <p class="subtitle">WASM (高性能) vs JavaScript (兼容性) - 统一 API 设计</p>

    <div class="input-section">
      <label for="qr-text">输入文本:</label>
      <input id="qr-text" v-model="refText" type="text" placeholder="Enter text to encode"
        @keyup.enter="updateQRCode" />
      <button @click="updateQRCode" :disabled="!isLoaded">
        {{ isLoaded ? '✨ 生成对比' : 'WASM 加载中...' }}
      </button>
    </div>

    <!-- 双引擎基础对比 -->
    <div class="field-div">
      <fieldset class="qrcode-container compare-section">
        <legend>⚖️ 基础对比 (API: get_svg / get_module_count)</legend>
        <div class="compare-grid">
          <div class="engine-card wasm-card">
            <div class="engine-header">
              <span class="engine-badge wasm">🦀 WASM</span>
              <span class="module-badge">{{ wasmModuleCount }} × {{ wasmModuleCount }}</span>
            </div>
            <div class="engine-preview" v-if="wasmSvg" v-html="wasmSvg"></div>
            <div class="engine-features">
              <span class="feature-tag">⚡ 高性能</span>
              <span class="feature-tag">🔄 实例复用</span>
              <span class="feature-tag">📦 批量生成</span>
            </div>
          </div>

          <div class="vs-divider">
            <span class="vs-text">VS</span>
          </div>

          <div class="engine-card js-card">
            <div class="engine-header">
              <span class="engine-badge js">🟨 JavaScript</span>
              <span class="module-badge">{{ jsModuleCount }} × {{ jsModuleCount }}</span>
            </div>
            <div class="engine-preview" v-if="jsSvg" v-html="jsSvg"></div>
            <div class="engine-features">
              <span class="feature-tag">🔧 零依赖</span>
              <span class="feature-tag">📱 兼容性好</span>
              <span class="feature-tag">🚀 即时加载</span>
            </div>
          </div>
        </div>
      </fieldset>

    </div>

    <!-- 样式库对比 -->
    <div class="field-div">
      <fieldset class="qrcode-container styled-section">
        <legend>🎨 样式库对比 (10种个性样式)</legend>
        <div class="styles-compare">
          <div v-for="style in styles" :key="style.key" class="style-compare-item">
            <p class="style-title">{{ style.name }}</p>
            <div class="style-pair">
              <div class="style-box">
                <div class="style-label">WASM</div>
                <div class="style-preview" v-if="wasmStyleSvgs[style.key]" v-html="wasmStyleSvgs[style.key]"></div>
              </div>
              <div class="style-box">
                <div class="style-label">JS</div>
                <div class="style-preview" v-if="jsStyleSvgs[style.key]" v-html="jsStyleSvgs[style.key]"></div>
              </div>
            </div>
          </div>
        </div>
      </fieldset>
    </div>

    <!-- 批量生成对比 -->
    <div class="field-div">
      <fieldset class="qrcode-container batch-section">
        <legend>📦 批量生成对比 (6个二维码)</legend>
        <div class="batch-compare">
          <div class="batch-column">
            <h4>🦀 WASM 批量</h4>
            <div class="batch-grid">
              <div v-for="(svg, index) in wasmBatchSvgs" :key="`wasm-${index}`" class="batch-item">
                <div class="batch-preview" v-html="svg"></div>
                <p class="batch-label">{{ index + 1 }}</p>
              </div>
            </div>
          </div>
          <div class="batch-column">
            <h4>🟨 JS 批量</h4>
            <div class="batch-grid">
              <div v-for="(svg, index) in jsBatchSvgs" :key="`js-${index}`" class="batch-item">
                <div class="batch-preview" v-html="svg"></div>
                <p class="batch-label">{{ index + 1 }}</p>
              </div>
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1400px;
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
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.input-section {
  display: flex;
  gap: 12px;
  margin: 0 auto 30px;
  align-items: center;
  justify-content: center;
  max-width: 600px;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.input-section label {
  font-weight: 600;
  color: #333;
}

.input-section input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
}

.input-section input:focus {
  outline: none;
  border-color: #667eea;
}

.input-section button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s;
}

.input-section button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.input-section button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.field-div {
  padding: 20px;
  background: #f8f9fa;
  margin-bottom: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow-x: auto;
}

.qrcode-container {
  border: none;
  padding: 28px;
  margin-bottom: 24px;
  /* background: white; */
  /* border-radius: 16px; */
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); */
  overflow-x: auto;
}

.qrcode-container legend {
  padding: 0 16px;
  font-weight: 700;
  color: #333;
  font-size: 18px;
}

/* 基础对比区域 */
.compare-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: center;
}

.engine-card {
  padding: 24px;
  border-radius: 16px;
  text-align: center;
}

.wasm-card {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
  border: 2px solid #fc8181;
}

.js-card {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 2px solid #fbbf24;
}

.engine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.engine-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 14px;
}

.engine-badge.wasm {
  background: #fc8181;
  color: white;
}

.engine-badge.js {
  background: #fbbf24;
  color: #92400e;
}

.module-badge {
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.engine-preview {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.engine-preview :deep(svg) {
  max-width: 180px;
  max-height: 180px;
}

.engine-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.feature-tag {
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vs-text {
  width: 50px;
  height: 50px;
  line-height: 50px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 样式对比区域 */
.styles-compare {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  min-width: 1200px;
}

.style-compare-item {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
}

.style-title {
  margin: 0 0 14px 0;
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.style-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.style-box {
  background: white;
  border-radius: 12px;
  padding: 12px;
}

.style-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 600;
}

.style-preview :deep(svg) {
  max-width: 120px;
  max-height: 120px;
  border-radius: 8px;
}

/* 批量对比区域 */
.batch-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.batch-column {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.batch-column h4 {
  margin: 0 0 16px 0;
  text-align: center;
  color: #333;
  font-size: 16px;
}

.batch-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.batch-item {
  text-align: center;
}

.batch-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  height: 130px;
}

.batch-preview :deep(svg) {
  max-width: 100px;
  max-height: 100px;
}

.batch-label {
  margin-top: 6px;
  font-size: 12px;
  color: #666;
}

@media (max-width: 768px) {
  .compare-grid {
    grid-template-columns: 1fr;
  }

  .vs-divider {
    order: -1;
  }

  .styles-compare {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .batch-compare {
    grid-template-columns: 1fr;
  }

  .batch-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
