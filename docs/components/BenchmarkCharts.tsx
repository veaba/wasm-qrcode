import React, { useState, useMemo } from 'react';

// 类型定义
interface BenchmarkData {
  name: string;
  node?: number;
  bun?: number;
  rust?: number;
  fast?: number;
  unit?: string;
}

interface BarChartProps {
  data: BenchmarkData[];
  title: string;
  height?: number;
}

// 颜色配置
const COLORS = {
  node: '#339933',
  bun: '#fbf0df',
  rust: '#dea584',
  fast: '#f59e0b',
  grid: '#e5e7eb',
  text: '#374151',
};

// 包配置
const PACKAGE_CONFIG = {
  node: { name: 'Node.js', color: COLORS.node, icon: '🟢' },
  bun: { name: 'Bun', color: COLORS.bun, icon: '🥟', textDark: true },
  rust: { name: 'Rust', color: COLORS.rust, icon: '🦀' },
  fast: { name: 'Rust (fast)', color: COLORS.fast, icon: '⚡' },
};

// 柱状图组件
export const BarChart: React.FC<BarChartProps> = ({ data, title, height = 300 }) => {
  const maxValue = useMemo(() => {
    return Math.max(
      ...data.flatMap(d => [d.node || 0, d.bun || 0, d.rust || 0, d.fast || 0])
    );
  }, [data]);

  const barWidth = 30;
  const gap = 15;
  const barsPerGroup = 4;
  const groupWidth = barWidth * barsPerGroup + gap * (barsPerGroup - 1);
  const chartWidth = data.length * groupWidth + (data.length + 1) * gap;
  const chartHeight = height - 60;

  // 获取实际存在的包列表
  const existingPackages = useMemo(() => {
    const packages: (keyof typeof PACKAGE_CONFIG)[] = [];
    if (data.some(d => d.node)) packages.push('node');
    if (data.some(d => d.bun)) packages.push('bun');
    if (data.some(d => d.rust)) packages.push('rust');
    if (data.some(d => d.fast)) packages.push('fast');
    return packages;
  }, [data]);

  const actualBarWidth = 30;
  const actualGap = 8;
  const actualGroupWidth = actualBarWidth * existingPackages.length + actualGap * (existingPackages.length - 1);
  const actualChartWidth = data.length * actualGroupWidth + (data.length + 1) * gap;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>{title}</h3>
      <div style={{ overflowX: 'auto' }}>
        <svg width={Math.max(actualChartWidth + 120, 600)} height={height}>
          {/* 网格线 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line
                x1={60}
                y1={chartHeight - ratio * chartHeight + 20}
                x2={actualChartWidth + 60}
                y2={chartHeight - ratio * chartHeight + 20}
                stroke={COLORS.grid}
                strokeDasharray="4"
              />
              <text
                x={50}
                y={chartHeight - ratio * chartHeight + 25}
                textAnchor="end"
                fontSize={12}
                fill={COLORS.text}
              >
                {Math.round(maxValue * ratio).toLocaleString()}
              </text>
            </g>
          ))}

          {/* 柱状图 */}
          {data.map((item, index) => {
            const groupX = 80 + index * (actualGroupWidth + gap);
            return (
              <g key={item.name}>
                {/* Node.js 柱 */}
                {item.node && (
                  <rect
                    x={groupX}
                    y={chartHeight - (item.node / maxValue) * chartHeight + 20}
                    width={actualBarWidth}
                    height={(item.node / maxValue) * chartHeight}
                    fill={COLORS.node}
                    rx={4}
                  />
                )}
                {/* Bun 柱 */}
                {item.bun && (
                  <rect
                    x={groupX + (item.node ? actualBarWidth + actualGap : 0)}
                    y={chartHeight - (item.bun / maxValue) * chartHeight + 20}
                    width={actualBarWidth}
                    height={(item.bun / maxValue) * chartHeight}
                    fill={COLORS.bun}
                    stroke="#d4a373"
                    strokeWidth={1}
                    rx={4}
                  />
                )}
                {/* Rust 柱 */}
                {item.rust && (
                  <rect
                    x={groupX + (item.node ? actualBarWidth + actualGap : 0) + (item.bun ? actualBarWidth + actualGap : 0)}
                    y={chartHeight - (item.rust / maxValue) * chartHeight + 20}
                    width={actualBarWidth}
                    height={(item.rust / maxValue) * chartHeight}
                    fill={COLORS.rust}
                    rx={4}
                  />
                )}
                {/* Fast 柱 */}
                {item.fast && (
                  <rect
                    x={groupX + (item.node ? actualBarWidth + actualGap : 0) + (item.bun ? actualBarWidth + actualGap : 0) + (item.rust ? actualBarWidth + actualGap : 0)}
                    y={chartHeight - (item.fast / maxValue) * chartHeight + 20}
                    width={actualBarWidth}
                    height={(item.fast / maxValue) * chartHeight}
                    fill={COLORS.fast}
                    rx={4}
                  />
                )}
                {/* 标签 */}
                <text
                  x={groupX + actualGroupWidth / 2}
                  y={chartHeight + 40}
                  textAnchor="middle"
                  fontSize={11}
                  fill={COLORS.text}
                >
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* 图例 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {existingPackages.includes('node') && <LegendItem color={COLORS.node} label="Node.js" />}
        {existingPackages.includes('bun') && <LegendItem color={COLORS.bun} label="Bun" border />}
        {existingPackages.includes('rust') && <LegendItem color={COLORS.rust} label="Rust (qrcode-rust)" />}
        {existingPackages.includes('fast') && <LegendItem color={COLORS.fast} label="Rust (qrcode-fast)" />}
      </div>
    </div>
  );
};

// 图例项组件
const LegendItem: React.FC<{ color: string; label: string; border?: boolean }> = ({
  color,
  label,
  border,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <div
      style={{
        width: 20,
        height: 20,
        backgroundColor: color,
        border: border ? '1px solid #d4a373' : 'none',
        borderRadius: 4,
      }}
    />
    <span style={{ fontSize: 14 }}>{label}</span>
  </div>
);

// 性能对比表格组件
interface ComparisonTableProps {
  data: BenchmarkData[];
  showWinner?: boolean;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ data, showWinner = true }) => {
  const getWinner = (item: BenchmarkData): string | null => {
    const values = [
      { name: 'Node.js', value: item.node || 0 },
      { name: 'Bun', value: item.bun || 0 },
      { name: 'Rust', value: item.rust || 0 },
      { name: 'Rust (fast)', value: item.fast || 0 },
    ].filter(v => v.value > 0);
    
    if (values.length === 0) return null;
    return values.reduce((max, curr) => (curr.value > max.value ? curr : max)).name;
  };

  // 获取实际存在的包
  const hasNode = data.some(d => d.node !== undefined);
  const hasBun = data.some(d => d.bun !== undefined);
  const hasRust = data.some(d => d.rust !== undefined);
  const hasFast = data.some(d => d.fast !== undefined);

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
      <thead>
        <tr style={{ backgroundColor: '#f3f4f6' }}>
          <th style={thStyle}>测试项</th>
          {hasNode && <th style={thStyle}>Node.js (ops/s)</th>}
          {hasBun && <th style={thStyle}>Bun (ops/s)</th>}
          {hasRust && <th style={thStyle}>Rust (ops/s)</th>}
          {hasFast && <th style={thStyle}>Rust Fast (ops/s)</th>}
          {showWinner && <th style={thStyle}>胜出</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => {
          const winner = getWinner(item);
          return (
            <tr key={item.name} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
              <td style={tdStyle}>{item.name}</td>
              {hasNode && (
                <td style={{ ...tdStyle, color: winner === 'Node.js' ? COLORS.node : 'inherit', fontWeight: winner === 'Node.js' ? 'bold' : 'normal' }}>
                  {item.node?.toLocaleString() || '-'}
                </td>
              )}
              {hasBun && (
                <td style={{ ...tdStyle, color: winner === 'Bun' ? '#d4a373' : 'inherit', fontWeight: winner === 'Bun' ? 'bold' : 'normal' }}>
                  {item.bun?.toLocaleString() || '-'}
                </td>
              )}
              {hasRust && (
                <td style={{ ...tdStyle, color: winner === 'Rust' ? COLORS.rust : 'inherit', fontWeight: winner === 'Rust' ? 'bold' : 'normal' }}>
                  {item.rust?.toLocaleString() || '-'}
                </td>
              )}
              {hasFast && (
                <td style={{ ...tdStyle, color: winner === 'Rust (fast)' ? COLORS.fast : 'inherit', fontWeight: winner === 'Rust (fast)' ? 'bold' : 'normal' }}>
                  {item.fast?.toLocaleString() || '-'}
                </td>
              )}
              {showWinner && (
                <td style={tdStyle}>
                  {winner && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor:
                          winner === 'Node.js' ? COLORS.node : 
                          winner === 'Bun' ? COLORS.bun : 
                          winner === 'Rust' ? COLORS.rust :
                          COLORS.fast,
                        color: winner === 'Bun' ? '#333' : 'white',
                        border: winner === 'Bun' ? '1px solid #d4a373' : 'none',
                      }}
                    >
                      {winner === 'Node.js' ? '🟢' : winner === 'Bun' ? '🥟' : winner === 'Rust' ? '🦀' : '⚡'} {winner}
                    </span>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

// 性能计算器组件
interface PerformanceCalculatorProps {
  data: BenchmarkData[];
}

export const PerformanceCalculator: React.FC<PerformanceCalculatorProps> = ({ data }) => {
  const [selectedTest, setSelectedTest] = useState(data[0]?.name || '');
  const [qrcodeCount, setQrcodeCount] = useState(100);

  const selectedData = data.find(d => d.name === selectedTest);

  const calculateTime = (opsPerSecond: number | undefined) => {
    if (!opsPerSecond) return null;
    const timeInMs = (qrcodeCount / opsPerSecond) * 1000;
    return timeInMs < 1000 ? `${timeInMs.toFixed(2)} ms` : `${(timeInMs / 1000).toFixed(2)} s`;
  };

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginTop: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>⚡ 性能计算器</h3>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 500 }}>
            选择测试项
          </label>
          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              minWidth: '200px',
            }}
          >
            {data.map(d => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 500 }}>
            QRCode 数量
          </label>
          <input
            type="number"
            value={qrcodeCount}
            onChange={(e) => setQrcodeCount(Math.max(1, parseInt(e.target.value) || 0))}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              width: '120px',
            }}
          />
        </div>
      </div>

      {selectedData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {selectedData.node && (
            <ResultCard
              label="Node.js"
              color={COLORS.node}
              time={calculateTime(selectedData.node)}
              ops={selectedData.node}
            />
          )}
          {selectedData.bun && (
            <ResultCard
              label="Bun"
              color={COLORS.bun}
              time={calculateTime(selectedData.bun)}
              ops={selectedData.bun}
              textDark
            />
          )}
          {selectedData.rust && (
            <ResultCard
              label="Rust"
              color={COLORS.rust}
              time={calculateTime(selectedData.rust)}
              ops={selectedData.rust}
            />
          )}
          {selectedData.fast && (
            <ResultCard
              label="Rust (fast)"
              color={COLORS.fast}
              time={calculateTime(selectedData.fast)}
              ops={selectedData.fast}
            />
          )}
        </div>
      )}
    </div>
  );
};

// 结果卡片组件
const ResultCard: React.FC<{
  label: string;
  color: string;
  time: string | null;
  ops: number;
  textDark?: boolean;
}> = ({ label, color, time, ops, textDark }) => (
  <div
    style={{
      padding: '1rem',
      backgroundColor: color,
      borderRadius: '8px',
      color: textDark ? '#333' : 'white',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '0.5rem' }}>{label}</div>
    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{time || '-'}</div>
    <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '0.25rem' }}>
      {ops.toLocaleString()} ops/s
    </div>
  </div>
);

// 样式常量
const thStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left' as const,
  fontWeight: 600,
  fontSize: '14px',
  borderBottom: '2px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '14px',
  borderBottom: '1px solid #e5e7eb',
};

// 导出所有组件
export default {
  BarChart,
  ComparisonTable,
  PerformanceCalculator,
};
