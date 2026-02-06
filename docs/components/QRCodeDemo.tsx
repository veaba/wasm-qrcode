import React, { useState, useEffect } from 'react';
import {
  QRCodeCore,
  QRErrorCorrectLevel,
  generateRoundedQRCode,
  generateGradientQRCode,
  generateQRCodeWithLogoArea,
  generateWechatStyleQRCode,
  generateDouyinStyleQRCode,
  generateAlipayStyleQRCode,
  generateXiaohongshuStyleQRCode,
  generateCyberpunkStyleQRCode,
  generateRetroStyleQRCode,
  generateMinimalStyleQRCode,
} from '@veaba/qrcode-js';

const basicStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

// 前端库选项
const LIBRARY_OPTIONS = [
  { id: 'js', name: '@veaba/qrcode-js', description: '纯 JavaScript 实现', color: '#3b82f6' },
  { id: 'wasm', name: '@veaba/qrcode-wasm', description: 'WebAssembly (Rust)', color: '#f97316' },
];

// 预设样式
const STYLE_PRESETS = [
  { id: 'basic', name: '基础', color: '#000000' },
  { id: 'rounded', name: '圆角', color: '#3b82f6' },
  { id: 'gradient', name: '渐变', color: '#667eea' },
  { id: 'logo', name: 'Logo区域', color: '#9377ff' },
  { id: 'wechat', name: '微信绿', color: '#07C160' },
  { id: 'douyin', name: '抖音', color: '#00F2EA' },
  { id: 'alipay', name: '支付宝', color: '#1677FF' },
  { id: 'xiaohongshu', name: '小红书', color: '#FF2442' },
  { id: 'cyberpunk', name: '赛博朋克', color: '#FF00FF' },
  { id: 'retro', name: '复古', color: '#8B4513' },
  { id: 'minimal', name: '极简', color: '#333333' },
];

// 尺寸预设
const SIZE_PRESETS = [
  { label: '小', value: 128 },
  { label: '中', value: 256 },
  { label: '大', value: 384 },
  { label: '特大', value: 512 },
];

// WASM 模块类型
interface WASMModule {
  generate_rounded_qrcode: (text: string, size: number, radius: number) => string;
  generate_gradient_qrcode: (text: string, size: number, color1: string, color2: string) => string;
  generate_wechat_style_qrcode: (text: string, size: number) => string;
  generate_douyin_style_qrcode: (text: string, size: number) => string;
  generate_alipay_style_qrcode: (text: string, size: number) => string;
  generate_xiaohongshu_style_qrcode: (text: string, size: number) => string;
  generate_cyberpunk_style_qrcode: (text: string, size: number) => string;
  generate_retro_style_qrcode: (text: string, size: number) => string;
  generate_minimal_style_qrcode: (text: string, size: number) => string;
  generate_qrcode_with_logo_area: (text: string, size: number, logo_ratio: number) => string;
  QRCodeWasm: new () => {
    make_code: (text: string) => void;
    get_svg: () => string;
  };
}

// WASM 初始化状态
let wasmModule: WASMModule | null = null;
let wasmInitPromise: Promise<WASMModule> | null = null;

const initWasmOnce = async (): Promise<WASMModule> => {
  if (wasmModule) return wasmModule;
  if (wasmInitPromise) return wasmInitPromise;

  wasmInitPromise = (async () => {
    // 动态导入 WASM 模块
    const wasmPkg = await import('@veaba/qrcode-wasm');
    // 初始化 WASM 模块（调用默认导出）
    await wasmPkg.default();
    // 初始化后，wasmPkg 中的函数已经绑定了正确的 wasm 实例
    wasmModule = {
      generate_rounded_qrcode: wasmPkg.generate_rounded_qrcode,
      generate_gradient_qrcode: wasmPkg.generate_gradient_qrcode,
      generate_wechat_style_qrcode: wasmPkg.generate_wechat_style_qrcode,
      generate_douyin_style_qrcode: wasmPkg.generate_douyin_style_qrcode,
      generate_alipay_style_qrcode: wasmPkg.generate_alipay_style_qrcode,
      generate_xiaohongshu_style_qrcode: wasmPkg.generate_xiaohongshu_style_qrcode,
      generate_cyberpunk_style_qrcode: wasmPkg.generate_cyberpunk_style_qrcode,
      generate_retro_style_qrcode: wasmPkg.generate_retro_style_qrcode,
      generate_minimal_style_qrcode: wasmPkg.generate_minimal_style_qrcode,
      generate_qrcode_with_logo_area: wasmPkg.generate_qrcode_with_logo_area,
      QRCodeWasm: wasmPkg.QRCodeWasm,
    };
    return wasmModule;
  })();

  return wasmInitPromise;
};

// 使用 JS 库生成二维码
const generateJSQRCode = (text: string, style: string, size: number): string => {
  switch (style) {
    case 'rounded':
      return generateRoundedQRCode(text, size, 8);
    case 'gradient':
      return generateGradientQRCode(text, size, '#667eea', '#764ba2');
    case 'logo':
      return generateQRCodeWithLogoArea(text, size, 0.2);
    case 'wechat':
      return generateWechatStyleQRCode(text, size);
    case 'douyin':
      return generateDouyinStyleQRCode(text, size);
    case 'alipay':
      return generateAlipayStyleQRCode(text, size);
    case 'xiaohongshu':
      return generateXiaohongshuStyleQRCode(text, size);
    case 'cyberpunk':
      return generateCyberpunkStyleQRCode(text, size);
    case 'retro':
      return generateRetroStyleQRCode(text, size);
    case 'minimal':
      return generateMinimalStyleQRCode(text, size);
    default:
      const qr = new QRCodeCore(text, QRErrorCorrectLevel.H);
      return qr.toSVG(size);
  }
};

// 使用 WASM 库生成二维码
const generateWASMQRCode = (mod: WASMModule, text: string, style: string, size: number): string => {
  switch (style) {
    case 'rounded':
      return mod.generate_rounded_qrcode(text, size, 8);
    case 'gradient':
      return mod.generate_gradient_qrcode(text, size, '#667eea', '#764ba2');
    case 'logo':
      return mod.generate_qrcode_with_logo_area(text, size, 0.2);
    case 'wechat':
      return mod.generate_wechat_style_qrcode(text, size);
    case 'douyin':
      return mod.generate_douyin_style_qrcode(text, size);
    case 'alipay':
      return mod.generate_alipay_style_qrcode(text, size);
    case 'xiaohongshu':
      return mod.generate_xiaohongshu_style_qrcode(text, size);
    case 'cyberpunk':
      return mod.generate_cyberpunk_style_qrcode(text, size);
    case 'retro':
      return mod.generate_retro_style_qrcode(text, size);
    case 'minimal':
      return mod.generate_minimal_style_qrcode(text, size);
    default: {
      const qr = new mod.QRCodeWasm();
      qr.make_code(text);
      return qr.get_svg();
    }
  }
};

// 样式展示卡片
const StyleCard: React.FC<{
  preset: (typeof STYLE_PRESETS)[0];
  text: string;
  size: number;
  library: string;
  wasmModule: WASMModule | null;
  isSelected: boolean;
  onClick: () => void;
}> = ({ preset, text, size, library, wasmModule, isSelected, onClick }) => {
  const [svg, setSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const generate = async () => {
      try {
        let result: string;
        if (library === 'wasm') {
          if (!wasmModule) {
            setIsLoading(false);
            return;
          }
          result = generateWASMQRCode(wasmModule, text, preset.id, size);
        } else {
          result = generateJSQRCode(text, preset.id, size);
        }
        if (isMounted) {
          setSvg(result);
        }
      } catch (error) {
        console.error('生成二维码失败:', error);
        if (isMounted) {
          setSvg('');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    generate();

    return () => {
      isMounted = false;
    };
  }, [text, preset.id, size, library, wasmModule]);

  return (
    <div
      onClick={onClick}
      style={{
        border: isSelected ? `2px solid ${preset.color}` : '2px solid transparent',
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: isSelected ? `${preset.color}10` : '#f9fafb',
        boxShadow: isSelected ? `0 4px 12px ${preset.color}30` : 'none',
      }}
    >
      {isLoading ? (
        <div
          style={{
            width: size,
            height: size,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#9ca3af',
            fontSize: '12px',
          }}
        >
          加载中...
        </div>
      ) : (
        <div
          dangerouslySetInnerHTML={{ __html: svg }}
          style={{
            width: size,
            height: size,
            margin: '0 auto',
            ...(preset.id === 'basic' ? basicStyle : {}),
          }}
        />
      )}
      <div
        style={{
          textAlign: 'center',
          marginTop: '12px',
          fontWeight: isSelected ? '600' : '400',
          color: isSelected ? preset.color : '#6b7280',
          fontSize: '14px',
        }}
      >
        {preset.name}
      </div>
    </div>
  );
};

// 主演示组件
export const QRCodeDemo: React.FC = () => {
  const [text, setText] = useState('https://github.com/veaba/qrcodes');
  const [selectedStyle, setSelectedStyle] = useState('basic');
  const [selectedLibrary, setSelectedLibrary] = useState('js');
  const [size, setSize] = useState(256);
  const [showCode, setShowCode] = useState(false);
  const [currentSVG, setCurrentSVG] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [wasmModuleState, setWasmModuleState] = useState<WASMModule | null>(null);
  const [wasmReady, setWasmReady] = useState(false);

  // 初始化 WASM
  useEffect(() => {
    initWasmOnce()
      .then((mod) => {
        setWasmModuleState(mod);
        setWasmReady(true);
      })
      .catch((error) => {
        console.error('WASM 初始化失败:', error);
      });
  }, []);

  // 生成当前选中的二维码
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const generate = async () => {
      try {
        let result: string;
        if (selectedLibrary === 'wasm') {
          if (!wasmModuleState) {
            setIsLoading(false);
            return;
          }
          result = generateWASMQRCode(wasmModuleState, text, selectedStyle, size);
        } else {
          result = generateJSQRCode(text, selectedStyle, size);
        }
        if (isMounted) {
          setCurrentSVG(result);
        }
      } catch (error) {
        console.error('生成二维码失败:', error);
        if (isMounted) {
          setCurrentSVG('');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    generate();

    return () => {
      isMounted = false;
    };
  }, [text, selectedStyle, size, selectedLibrary, wasmModuleState]);

  const currentPreset = STYLE_PRESETS.find((p) => p.id === selectedStyle) || STYLE_PRESETS[0];
  const currentLibrary = LIBRARY_OPTIONS.find((l) => l.id === selectedLibrary) || LIBRARY_OPTIONS[0];

  const generateCodeSnippet = () => {
    const importMap: Record<string, string> = {
      js: '@veaba/qrcode-js',
      wasm: '@veaba/qrcode-wasm',
    };

    const packageName = importMap[selectedLibrary];

    if (selectedLibrary === 'js') {
      const codeMap: Record<string, string> = {
        basic: `import { QRCodeCore, QRErrorCorrectLevel } from '${packageName}';

const qr = new QRCodeCore('${text}', QRErrorCorrectLevel.H);
const svg = qr.toSVG(${size});`,
        rounded: `import { generateRoundedQRCode } from '${packageName}';

const svg = generateRoundedQRCode('${text}', ${size}, 8);`,
        gradient: `import { generateGradientQRCode } from '${packageName}';

const svg = generateGradientQRCode('${text}', ${size}, '#667eea', '#764ba2');`,
        logo: `import { generateQRCodeWithLogoArea } from '${packageName}';

const svg = generateQRCodeWithLogoArea('${text}', ${size}, 0.2);`,
        wechat: `import { generateWechatStyleQRCode } from '${packageName}';

const svg = generateWechatStyleQRCode('${text}', ${size});`,
        douyin: `import { generateDouyinStyleQRCode } from '${packageName}';

const svg = generateDouyinStyleQRCode('${text}', ${size});`,
        alipay: `import { generateAlipayStyleQRCode } from '${packageName}';

const svg = generateAlipayStyleQRCode('${text}', ${size});`,
        xiaohongshu: `import { generateXiaohongshuStyleQRCode } from '${packageName}';

const svg = generateXiaohongshuStyleQRCode('${text}', ${size});`,
        cyberpunk: `import { generateCyberpunkStyleQRCode } from '${packageName}';

const svg = generateCyberpunkStyleQRCode('${text}', ${size});`,
        retro: `import { generateRetroStyleQRCode } from '${packageName}';

const svg = generateRetroStyleQRCode('${text}', ${size});`,
        minimal: `import { generateMinimalStyleQRCode } from '${packageName}';

const svg = generateMinimalStyleQRCode('${text}', ${size});`,
      };
      return codeMap[selectedStyle] || codeMap.basic;
    } else {
      // WASM 代码示例
      const codeMap: Record<string, string> = {
        basic: `import wasmPkg from '${packageName}';

const mod = await wasmPkg.default();
const qr = new mod.QRCodeWasm();
qr.make_code('${text}');
const svg = qr.get_svg();`,
        rounded: `import wasmPkg from '${packageName}';

const mod = await wasmPkg.default();
const svg = mod.generate_rounded_qrcode('${text}', ${size}, 8);`,
        gradient: `import wasmPkg from '${packageName}';

const mod = await wasmPkg.default();
const svg = mod.generate_gradient_qrcode('${text}', ${size}, '#667eea', '#764ba2');`,
        logo: `import wasmPkg from '${packageName}';

const mod = await wasmPkg.default();
const svg = mod.generate_qrcode_with_logo_area('${text}', ${size}, 0.2);`,
        wechat: `import wasmPkg from '${packageName}';

const mod = await wasmPkg.default();
const svg = mod.generate_wechat_style_qrcode('${text}', ${size});`,
        douyin: `import wasmPkg from '${packageName}';

const mod = await wasmPkg.default();
const svg = mod.generate_douyin_style_qrcode('${text}', ${size});`,
        alipay: `import wasmPkg from '${packageName}';

const mod = await wasmPkg.default();
const svg = mod.generate_alipay_style_qrcode('${text}', ${size});`,
        xiaohongshu: `import wasmPkg from '${packageName}';

const mod = await wasmPkg.default();
const svg = mod.generate_xiaohongshu_style_qrcode('${text}', ${size});`,
        cyberpunk: `import wasmPkg from '${packageName}';

const mod = await wasmPkg.default();
const svg = mod.generate_cyberpunk_style_qrcode('${text}', ${size});`,
        retro: `import wasmPkg from '${packageName}';

const mod = await wasmPkg.default();
const svg = mod.generate_retro_style_qrcode('${text}', ${size});`,
        minimal: `import wasmPkg from '${packageName}';

const mod = await wasmPkg.default();
const svg = mod.generate_minimal_style_qrcode('${text}', ${size});`,
      };
      return codeMap[selectedStyle] || codeMap.basic;
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 标题 */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>QRCode 样式演示</h2>
        <p style={{ color: '#6b7280' }}>选择不同的样式和前端库，实时预览效果</p>
      </div>

      {/* 控制面板 */}
      <div
        style={{
          display: 'grid',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* 文本输入 */}
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            QRCode 内容
          </label>
          <input
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='输入文本或 URL'
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
            }}
          />
        </div>

        {/* 前端库选择 */}
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            前端库
            {!wasmReady && selectedLibrary === 'wasm' && (
              <span style={{ color: '#f97316', fontSize: '12px', marginLeft: '8px' }}>(初始化中...)</span>
            )}
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {LIBRARY_OPTIONS.map((lib) => (
              <button
                key={lib.id}
                onClick={() => setSelectedLibrary(lib.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: selectedLibrary === lib.id ? `2px solid ${lib.color}` : '1px solid #d1d5db',
                  backgroundColor: selectedLibrary === lib.id ? `${lib.color}10` : 'white',
                  color: selectedLibrary === lib.id ? lib.color : '#374151',
                  fontWeight: selectedLibrary === lib.id ? '500' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '13px',
                }}
              >
                <span style={{ fontWeight: 600 }}>{lib.name}</span>
                <span style={{ fontSize: '11px', opacity: 0.8, padding: '0 10px' }}>{lib.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 尺寸选择 */}
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            尺寸
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {SIZE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setSize(preset.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: size === preset.value ? `2px solid ${currentPreset.color}` : '1px solid #d1d5db',
                  backgroundColor: size === preset.value ? `${currentPreset.color}10` : 'white',
                  color: size === preset.value ? currentPreset.color : '#374151',
                  fontWeight: size === preset.value ? '500' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 当前选中样式的大预览 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem',
          backgroundColor: '#f9fafb',
          borderRadius: '16px',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            marginBottom: '0.5rem',
            fontSize: '18px',
            fontWeight: '500',
            color: currentPreset.color,
          }}
        >
          {currentPreset.name}样式
        </div>
        <div
          style={{
            fontSize: '13px',
            color: currentLibrary.color,
            marginBottom: '1rem',
            padding: '4px 12px',
            backgroundColor: `${currentLibrary.color}10`,
            borderRadius: '12px',
          }}
        >
          {currentLibrary.name}
        </div>
        {isLoading ? (
          <div
            style={{
              width: size,
              height: size,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#9ca3af',
            }}
          >
            生成中...
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: currentSVG }} />
        )}
        <div style={{ marginTop: '1rem', color: '#6b7280', fontSize: '14px' }}>
          {size} x {size} px
        </div>

        {/* 代码切换按钮 */}
        <button
          onClick={() => setShowCode(!showCode)}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {showCode ? '隐藏代码' : '显示代码'}
        </button>

        {/* 代码片段 */}
        {showCode && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#1f2937',
              borderRadius: '8px',
              overflow: 'auto',
              maxWidth: '100%',
            }}
          >
            <pre
              style={{
                margin: 0,
                color: '#e5e7eb',
                fontSize: '13px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {generateCodeSnippet()}
            </pre>
          </div>
        )}
      </div>

      {/* 所有样式网格 */}
      <div>
        <h3
          style={{
            marginBottom: '1rem',
            fontSize: '18px',
            fontWeight: '500',
          }}
        >
          所有样式
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1rem',
          }}
        >
          {STYLE_PRESETS.map((preset) => (
            <StyleCard
              key={preset.id}
              preset={preset}
              text={text}
              size={128}
              library={selectedLibrary}
              wasmModule={wasmModuleState}
              isSelected={selectedStyle === preset.id}
              onClick={() => setSelectedStyle(preset.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QRCodeDemo;
