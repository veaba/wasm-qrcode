import React, { useState, useEffect } from 'react';

interface BenchmarkResult {
  package: string;
  ops: number;
  avgTime: number;
  rank: number;
}

interface ComparisonResult {
  testName: string;
  category: 'single' | 'batch' | 'svg' | 'error_level';
  results: BenchmarkResult[];
  winner: string;
  speedup: number;
}

interface PKBenchmarkData {
  timestamp: string;
  environment: {
    platform: string;
    cpu: string;
    nodeVersion?: string;
    bunVersion?: string;
    rustVersion?: string;
  };
  comparison: ComparisonResult[];
}

const PACKAGE_COLORS: Record<string, string> = {
  '@veaba/qrcode-node': '#339933',
  '@veaba/qrcode-bun': '#fbf0df',
  '@veaba/qrcode-rust': '#dea584',
  '@veaba/qrcode-fast': '#ff6b35',
  'kennytm-qrcode': '#6b7280',
};

const PACKAGE_ICONS: Record<string, string> = {
  '@veaba/qrcode-node': '🟢',
  '@veaba/qrcode-bun': '🥟',
  '@veaba/qrcode-rust': '🦀',
  '@veaba/qrcode-fast': '⚡',
  'kennytm-qrcode': '📦',
};

const CATEGORY_NAMES: Record<string, string> = {
  single: '📝 单条生成',
  batch: '📚 批量生成',
  svg: '🎨 SVG 生成',
  error_level: '🔧 纠错级别',
};

export const PKBenchmarkDashboard: React.FC = () => {
  const [data, setData] = useState<PKBenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetch('/backend_benchmark_pk.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load benchmark data');
        return res.json();
      })
      .then((data: PKBenchmarkData) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem' }}>⏳ 加载基准测试数据...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <div style={{ fontSize: '1.5rem' }}>❌ 加载失败</div>
        <p>{error || '暂无数据，请运行基准测试'}</p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
          运行命令: <code>cd bench/backend-benchmark-pk && npm run bench</code>
        </p>
      </div>
    );
  }

  const categories = ['all', ...new Set(data.comparison.map((c) => c.category))];
  
  const filteredComparison = selectedCategory === 'all' 
    ? data.comparison 
    : data.comparison.filter((c) => c.category === selectedCategory);

  // 找出每个包的最佳表现
  const packageWins: Record<string, number> = {};
  data.comparison.forEach((comp) => {
    const winner = comp.results[0]?.package;
    if (winner) {
      packageWins[winner] = (packageWins[winner] || 0) + 1;
    }
  });

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* 环境信息 */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>🖥️ 测试环境</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>平台</span>
            <div style={{ fontWeight: 600 }}>{data.environment.platform}</div>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>CPU</span>
            <div style={{ fontWeight: 600 }}>{data.environment.cpu}</div>
          </div>
          {data.environment.nodeVersion && (
            <div>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Node.js</span>
              <div style={{ fontWeight: 600 }}>{data.environment.nodeVersion}</div>
            </div>
          )}
          {data.environment.bunVersion && (
            <div>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Bun</span>
              <div style={{ fontWeight: 600 }}>{data.environment.bunVersion}</div>
            </div>
          )}
          {data.environment.rustVersion && (
            <div>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Rust</span>
              <div style={{ fontWeight: 600 }}>{data.environment.rustVersion}</div>
            </div>
          )}
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
          测试时间: {new Date(data.timestamp).toLocaleString()}
        </div>
      </div>

      {/* 冠军统计 */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>🏆 冠军统计</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {Object.entries(packageWins)
            .sort((a, b) => b[1] - a[1])
            .map(([pkg, wins]) => (
              <div
                key={pkg}
                style={{
                  backgroundColor: PACKAGE_COLORS[pkg] || '#6b7280',
                  color: pkg === '@veaba/qrcode-bun' ? '#333' : 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{PACKAGE_ICONS[pkg] || '📦'}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{pkg}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{wins} 项第一</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 分类筛选 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>📊 测试结果</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedCategory === cat ? '#3b82f6' : '#e2e8f0',
                color: selectedCategory === cat ? 'white' : '#475569',
                fontWeight: selectedCategory === cat ? 600 : 400,
              }}
            >
              {cat === 'all' ? '全部' : CATEGORY_NAMES[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* 测试结果表格 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>测试项</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>排名</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>包</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0' }}>ops/s</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0' }}>平均耗时</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0' }}>速度提升</th>
            </tr>
          </thead>
          <tbody>
            {filteredComparison.map((comp, compIndex) => (
              <React.Fragment key={comp.testName}>
                {comp.results.map((result, resultIndex) => (
                  <tr
                    key={`${comp.testName}-${result.package}`}
                    style={{
                      backgroundColor: resultIndex === 0 ? '#dcfce7' : resultIndex % 2 === 0 ? 'white' : '#f8fafc',
                      borderBottom: resultIndex === comp.results.length - 1 ? '2px solid #e2e8f0' : '1px solid #e2e8f0',
                    }}
                  >
                    {resultIndex === 0 && (
                      <td
                        rowSpan={comp.results.length}
                        style={{
                          padding: '0.75rem',
                          fontWeight: 600,
                          verticalAlign: 'top',
                          borderRight: '1px solid #e2e8f0',
                        }}
                      >
                        <div>{comp.testName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {CATEGORY_NAMES[comp.category]}
                        </div>
                      </td>
                    )}
                    <td
                      style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        fontWeight: result.rank === 1 ? 'bold' : 'normal',
                        color: result.rank === 1 ? '#16a34a' : 'inherit',
                      }}
                    >
                      {result.rank === 1 ? '🏆' : result.rank}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{PACKAGE_ICONS[result.package] || '📦'}</span>
                        <span style={{ fontWeight: result.rank === 1 ? 600 : 400 }}>{result.package}</span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        fontWeight: result.rank === 1 ? 600 : 400,
                        color: result.rank === 1 ? '#16a34a' : 'inherit',
                        fontFamily: 'monospace',
                      }}
                    >
                      {result.ops.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        fontFamily: 'monospace',
                      }}
                    >
                      {result.avgTime.toFixed(2)} µs
                    </td>
                    {resultIndex === 0 && (
                      <td
                        rowSpan={comp.results.length}
                        style={{
                          padding: '0.75rem',
                          textAlign: 'right',
                          fontWeight: 'bold',
                          color: '#16a34a',
                          verticalAlign: 'middle',
                        }}
                      >
                        {comp.speedup.toFixed(2)}x
                      </td>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 说明 */}
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', fontSize: '0.875rem' }}>
        <strong>💡 说明:</strong>
        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
          <li><strong>ops/s</strong>: 每秒操作数，数值越高性能越好</li>
          <li><strong>平均耗时</strong>: 每次操作的平均时间（微秒），数值越低越好</li>
          <li><strong>速度提升</strong>: 最快包相对于最慢包的速度倍数</li>
          <li>绿色高亮行为该测试项的冠军</li>
        </ul>
      </div>
    </div>
  );
};

export default PKBenchmarkDashboard;
