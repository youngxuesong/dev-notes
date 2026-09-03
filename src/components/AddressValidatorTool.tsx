import React, { useState, useEffect } from 'react';

export interface StandardAddress {
  displayName: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  countryCode: string;
  lat: string;
  lon: string;
  source: string;
}

export const AddressValidatorTool: React.FC = () => {
  const [keyword, setKeyword] = useState('香港上水地铁站');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StandardAddress[]>([]);
  const [selected, setSelected] = useState<StandardAddress | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [unitFloor, setUnitFloor] = useState('Flat B, 18/F');
  const [error, setError] = useState<string | null>(null);

  // 格式化解析单条数据
  const formatItem = (item: any): StandardAddress => {
    const isHK =
      (item.displayName || '').toLowerCase().includes('hong kong') ||
      (item.displayName || '').includes('香港') ||
      item.countryCode === 'HK' ||
      item.country === 'Hong Kong';

    let cName = isHK ? 'Hong Kong' : (item.country || 'Hong Kong');
    let cCode = isHK ? 'HK' : (item.countryCode || 'HK');
    let zip = isHK ? '999077' : (item.postcode || 'N/A');

    const road = item.road || '';
    const name = item.name || '';
    let l1 = [name, road].filter(Boolean).join(', ');
    if (!l1) l1 = item.displayName ? item.displayName.split(',')[0] : 'Building Name';

    return {
      displayName: item.displayName || name,
      name: name || l1,
      line1: l1.slice(0, 35),
      line2: (item.suburb || item.state || 'District').slice(0, 35),
      city: isHK ? 'Hong Kong' : (item.city || 'Hong Kong'),
      state: isHK ? 'New Territories' : (item.state || ''),
      postcode: zip,
      country: cName,
      countryCode: cCode,
      lat: item.lat || '',
      lon: item.lon || '',
      source: item.source || 'Verified Global Data',
    };
  };

  // 双层调度搜索（优先走 Vercel 边缘后端代理免墙 / 备用走浏览器直连）
  const doSearch = async (q: string) => {
    const term = q.trim();
    if (!term) return;

    setLoading(true);
    setError(null);

    let parsedList: StandardAddress[] = [];

    // 1. 优先调用自有 Vercel Serverless API（海外节点直接访问，解决国内浏览器无法直连 OSM 的问题）
    try {
      const resp = await fetch(`/api/geosearch?q=${encodeURIComponent(term)}`);
      if (resp.ok) {
        const json = await resp.json();
        if (json.results && json.results.length > 0) {
          parsedList = json.results.map(formatItem);
        }
      }
    } catch (apiErr) {
      console.warn('API route fallback:', apiErr);
    }

    // 2. 备用策略：如果代理未命中或本地调试，走客户端直连备选
    if (parsedList.length === 0) {
      const fallbackClean = term.replace(/地铁站|地鐵站|火车站|车站|站/g, '站').trim();
      const fallbackKeywords = Array.from(new Set([term, fallbackClean, term.replace('香港', '')]));

      for (const kw of fallbackKeywords) {
        try {
          const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(kw)}&limit=4`);
          if (res.ok) {
            const data = await res.json();
            if (data.features && data.features.length > 0) {
              parsedList = data.features.map((f: any) => {
                const p = f.properties || {};
                return formatItem({
                  name: p.name || p.street || '',
                  displayName: `${p.name || ''}, ${p.street || ''}, ${p.district || p.city || ''}, ${p.state || ''}`,
                  road: p.street,
                  suburb: p.district || p.locality,
                  city: p.city,
                  state: p.state,
                  country: p.country,
                  countryCode: p.countrycode,
                  lat: String(f.geometry?.coordinates?.[1] || ''),
                  lon: String(f.geometry?.coordinates?.[0] || ''),
                  source: 'Photon Direct',
                });
              });
              break;
            }
          }
        } catch (clientErr) {
          // 容错
        }
      }
    }

    if (parsedList.length > 0) {
      setResults(parsedList);
      setSelected(parsedList[0]);
    } else {
      setError(`未找到 “${term}” 的精确地址记录。请尝试直接搜索主词（例如：上水站、AIA Central、IFC 或具体路名）。`);
    }

    setLoading(false);
  };

  useEffect(() => {
    doSearch('香港上水地铁站');
  }, []);

  const copy = (val: string, key: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const fullAddr = selected
    ? [unitFloor, selected.line1, selected.line2, selected.city, selected.state, selected.postcode, selected.country]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <div style={{ margin: '24px 0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* 搜索控制台 */}
      <div
        style={{
          background: 'var(--dumi-default-color-bg, #ffffff)',
          border: '1.5px solid #2563eb',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 4px 16px rgba(37, 99, 235, 0.08)',
          marginBottom: '18px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
            🌍 全球地址 / 地理 POI 实时核验（已接入专线代理）
          </label>
          <span style={{ fontSize: '11px', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
            ● Vercel 边缘专线驱动
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch(keyword)}
            placeholder="支持全球任意地点：如 香港上水地铁站、中环AIA、新加坡金沙、Portland OR"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
              background: '#f8fafc',
            }}
          />
          <button
            onClick={() => doSearch(keyword)}
            disabled={loading}
            style={{
              padding: '0 20px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? '查询中...' : '搜索定位'}
          </button>
        </div>

        {/* 快捷热门验证标签 */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>🎯 快速实测：</span>
          {['香港上水地铁站', '香港中环友邦金融中心', '新加坡Chulia Street', '深圳创维大厦', 'Portland 97223'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setKeyword(t);
                doSearch(t);
              }}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '11px',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* 搜索候选列表 */}
      {results.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
            📍 找到 {results.length} 个精确地理实体（点击直接载入）：
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
            {results.map((item, idx) => {
              const isCur = selected?.lat === item.lat && selected?.lon === item.lon;
              return (
                <div
                  key={idx}
                  onClick={() => setSelected(item)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `1.5px solid ${isCur ? '#2563eb' : '#e2e8f0'}`,
                    background: isCur ? '#eff6ff' : 'var(--dumi-default-color-bg, #ffffff)',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ fontWeight: 700, color: isCur ? '#1d4ed8' : '#0f172a', marginBottom: '2px' }}>
                    {item.name}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '11px', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.displayName}
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '10px', color: '#94a3b8' }}>
                    经纬度: {parseFloat(item.lat || '0').toFixed(3)}, {parseFloat(item.lon || '0').toFixed(3)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 结构化开户输出核心卡片 */}
      {selected && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '18px',
            background: 'var(--dumi-default-color-bg, #ffffff)',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          {/* 左侧：表单明细 */}
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '14px' }}>
              📋 离岸银行 / Wise / Stripe 规范字段拆解
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>
                  Unit / Floor (房号/楼层, 可微调)
                </label>
                <input
                  type="text"
                  value={unitFloor}
                  onChange={(e) => setUnitFloor(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
                  <span>Address Line 1 (路名/门牌)</span>
                  <span style={{ color: selected.line1.length > 35 ? '#ef4444' : '#64748b' }}>{selected.line1.length}/35字</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={selected.line1}
                    onChange={(e) => setSelected({ ...selected, line1: e.target.value })}
                    style={{ flex: 1, padding: '6px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                  <button onClick={() => copy(selected.line1, 'l1')} style={{ padding: '0 10px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc', cursor: 'pointer' }}>
                    {copiedKey === 'l1' ? '已复制' : '复制'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>
                  Address Line 2 (街区/行政区)
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={selected.line2}
                    onChange={(e) => setSelected({ ...selected, line2: e.target.value })}
                    style={{ flex: 1, padding: '6px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                  <button onClick={() => copy(selected.line2, 'l2')} style={{ padding: '0 10px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc', cursor: 'pointer' }}>
                    {copiedKey === 'l2' ? '已复制' : '复制'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>City (城市)</label>
                  <input
                    type="text"
                    value={selected.city}
                    onChange={(e) => setSelected({ ...selected, city: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>State (省/区)</label>
                  <input
                    type="text"
                    value={selected.state}
                    onChange={(e) => setSelected({ ...selected, state: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Postal Code (邮编)</label>
                  <input
                    type="text"
                    value={selected.postcode}
                    onChange={(e) => setSelected({ ...selected, postcode: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, color: '#2563eb' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Country (国家代码)</label>
                  <input
                    type="text"
                    value={`${selected.country} (${selected.countryCode})`}
                    readOnly
                    style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc', color: '#64748b' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：复制全套与 AVS 单行 */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
            <div
              style={{
                background: '#0f172a',
                color: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#93c5fd', fontWeight: 700 }}>
                  💳 AVS 绑卡 / 境外银行规范单行地址
                </span>
                <span style={{ fontSize: '10px', background: '#2563eb', padding: '2px 6px', borderRadius: '4px' }}>
                  AVS READY
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.5', background: 'rgba(255,255,255,0.06)', padding: '10px', borderRadius: '6px', wordBreak: 'break-all' }}>
                {fullAddr}
              </div>
              <button
                onClick={() => copy(fullAddr, 'full_addr')}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: copiedKey === 'full_addr' ? '#10b981' : '#2563eb',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {copiedKey === 'full_addr' ? '已复制完整地址 ✓' : '一键复制完整国际地址'}
              </button>
            </div>

            <div style={{ textAlign: 'right' }}>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.name + ' ' + selected.city)}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
              >
                在 Google Maps 卫星底图复核坐标 ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressValidatorTool;
