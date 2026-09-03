import React, { useState, useEffect } from 'react';

interface SearchResultItem {
  displayName: string;
  name: string;
  lat: string;
  lon: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  postcode?: string;
}

export const AddressValidatorTool: React.FC = () => {
  const [query, setQuery] = useState('香港上水地铁站');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 当前选中的结构化地址
  const [roomFloor, setRoomFloor] = useState('Flat A, 18/F');
  const [line1, setLine1] = useState('Choi Yuen Road (Near Sheung Shui Station)');
  const [line2, setLine2] = useState('Sheung Shui Town, North District');
  const [city, setCity] = useState('Hong Kong');
  const [state, setState] = useState('New Territories');
  const [postcode, setPostcode] = useState('999077');
  const [country, setCountry] = useState('Hong Kong');
  const [countryCode, setCountryCode] = useState('HK');
  const [latLon, setLatLon] = useState({ lat: '22.5012', lon: '114.1272' });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 核心全球搜索多路召回引擎（自动分词、去噪、跨国模糊匹配）
  const executeGlobalSearch = async (keyword: string) => {
    const raw = keyword.trim();
    if (!raw) return;

    setLoading(true);
    setError(null);

    // 智能分词优化：香港常称“地鐵/站/車站/Station”，将连续关键词空格化以匹配全球索引
    const cleanKw = raw
      .replace(/地铁站|地鐵站|车站|車站|火车站/g, ' 站 ')
      .replace(/特别行政区|特区/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const candidates = [
      raw,
      cleanKw,
      raw.replace('香港', 'Hong Kong '),
      raw.replace('地铁站', ' Station'),
      raw.replace('站', ' Station'),
    ];

    let foundItems: any[] = [];

    for (const q of Array.from(new Set(candidates))) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q,
        )}&addressdetails=1&limit=5`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'zh-CN,zh-HK,zh-TW,en;q=0.9',
          },
        });
        const data = await res.json();
        if (data && data.length > 0) {
          foundItems = data;
          break;
        }
      } catch (e) {
        // 继续重试下一关键词
      }
    }

    if (foundItems.length > 0) {
      const parsedList: SearchResultItem[] = foundItems.map((item: any) => {
        const addr = item.address || {};
        return {
          displayName: item.display_name,
          name: item.name || item.display_name.split(',')[0],
          lat: item.lat,
          lon: item.lon,
          road: addr.road || addr.pedestrian || addr.highway || addr.street || '',
          suburb: addr.suburb || addr.quarter || addr.district || addr.neighbourhood || '',
          city: addr.city || addr.town || addr.municipality || addr.county || 'Hong Kong',
          state: addr.state || addr.region || addr.province || '',
          country: addr.country || 'Hong Kong',
          countryCode: (addr.country_code || '').toUpperCase(),
          postcode: addr.postcode || '',
        };
      });

      setSearchResults(parsedList);
      applySelectedResult(parsedList[0]);
    } else {
      setError(`未找到 “${raw}” 的全球精确地理记录。请尝试精简关键词（如搜索：上水站 或 Sheung Shui）。`);
    }

    setLoading(false);
  };

  // 点击选择搜索结果，自动结构化填充
  const applySelectedResult = (item: SearchResultItem) => {
    setLatLon({ lat: parseFloat(item.lat).toFixed(4), lon: parseFloat(item.lon).toFixed(4) });

    // 智能推断国家与城市
    const isHK =
      item.displayName.includes('香港') ||
      item.displayName.includes('Hong Kong') ||
      item.countryCode === 'HK' ||
      item.country === 'Hong Kong';
    const isMacau =
      item.displayName.includes('澳门') ||
      item.displayName.includes('Macau') ||
      item.countryCode === 'MO';

    let cName = item.country || 'Hong Kong';
    let cCode = item.countryCode || 'HK';
    let zipCode = item.postcode;

    if (isHK) {
      cName = 'Hong Kong';
      cCode = 'HK';
      zipCode = '999077'; // 解决海外银行/Stripe必填香港邮编风控
    } else if (isMacau) {
      cName = 'Macau';
      cCode = 'MO';
      zipCode = '999078';
    }

    const roadAndName = [item.name, item.road].filter(Boolean).join(', ');
    setLine1(roadAndName || item.displayName.slice(0, 35));
    setLine2(item.suburb || item.state || 'North District');
    setCity(isHK ? 'Hong Kong' : item.city || 'Hong Kong');
    setState(item.state || (isHK ? 'New Territories' : ''));
    setPostcode(zipCode || '999077');
    setCountry(cName);
    setCountryCode(cCode);
  };

  useEffect(() => {
    executeGlobalSearch('香港上水地铁站');
  }, []);

  const copy = (txt: string, key: string) => {
    if (!txt) return;
    navigator.clipboard.writeText(txt);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const finalFullAddress = [
    roomFloor,
    line1,
    line2,
    city,
    state,
    postcode,
    country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      style={{
        margin: '24px 0',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 搜索控制台 */}
      <div
        style={{
          background: 'var(--dumi-default-color-bg, #ffffff)',
          border: '1.5px solid #2563eb',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
            🌍 全球地点与地址实时中英智能搜索 (支持香港/海外/大陆任意地点)
          </label>
          <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
            OSM 全球高精地理数据库
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeGlobalSearch(query)}
            placeholder="输入全球任意地点、地铁站、商厦、楼盘（如：香港上水地铁站、新加坡滨海湾金沙、深圳湾科技生态园）"
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
              background: '#f8fafc',
            }}
          />
          <button
            onClick={() => executeGlobalSearch(query)}
            disabled={loading}
            style={{
              padding: '0 24px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            }}
          >
            {loading ? '🔍 全球匹配中...' : '🔍 全球搜索并转换'}
          </button>
        </div>

        {/* 快捷推荐热词 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>💡 热门实操测试：</span>
          {[
            '香港上水地铁站',
            '香港中环国际金融中心IFC',
            '新加坡乌节路ION',
            '深圳市南山区科技园创维大厦',
            'Portland OR 97223 (免税州)',
          ].map((hot) => (
            <button
              key={hot}
              onClick={() => {
                setQuery(hot);
                executeGlobalSearch(hot);
              }}
              style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {hot}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#e11d48',
            borderRadius: '10px',
            marginBottom: '18px',
            fontSize: '13px',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* 搜索候选列表 (如果有多条结果，允许用户精确点选) */}
      {searchResults.length > 1 && (
        <div
          style={{
            background: 'var(--dumi-default-color-bg, #ffffff)',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
            🎯 找到 {searchResults.length} 个匹配地理位置（点击切换精准定位）：
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => applySelectedResult(item)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: item.lat === latLon.lat ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${item.lat === latLon.lat ? '#60a5fa' : 'transparent'}`,
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#334155',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>📍 <strong>{item.name}</strong> - <span style={{ color: '#64748b' }}>{item.displayName}</span></span>
                <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '11px' }}>
                  {item.lat === latLon.lat ? '当前选中 ✓' : '选择'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 核心双栏面板：左侧银行合规拆解 + 右侧全场景复制卡片 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* 左侧：可精准自定义编辑的 6 字段 */}
        <div
          style={{
            background: 'var(--dumi-default-color-bg, #ffffff)',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
              📋 银行 KYC / Stripe 国际标准字段拆解
            </span>
            <span style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
              ● 坐标: {latLon.lat}, {latLon.lon}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 房间号 / 楼层（可选微调） */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Unit / Room / Floor (房号/楼层, 可自定义)
              </label>
              <input
                type="text"
                value={roomFloor}
                onChange={(e) => setRoomFloor(e.target.value)}
                placeholder="例如: Flat A, 18/F 或 Room 1801"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Address Line 1 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                <span>Address Line 1 (路名/门牌/主建筑)</span>
                <span style={{ color: line1.length > 35 ? '#e11d48' : '#64748b' }}>{line1.length}/35字</span>
              </div>
              <input
                type="text"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${line1.length > 35 ? '#f43f5e' : '#cbd5e1'}`,
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Address Line 2 (行政区/街区/备用)
              </label>
              <input
                type="text"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* City & State */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  City (城市)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  State / Region (省/大区)
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Postcode & Country */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Postal / ZIP Code (邮编)
                </label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, color: '#2563eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Country (国家/地区代码)
                </label>
                <input
                  type="text"
                  value={`${country} (${countryCode})`}
                  readOnly
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', background: '#f8fafc', color: '#64748b' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：出海场景一键复制卡片矩阵 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 场景 1：香港发钞行/离岸银行 KYC 开户填表格式 */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #0284c7',
              borderRadius: '14px',
              padding: '18px',
              boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 800, fontSize: '13px', color: '#0369a1' }}>
                🏦 境外银行开户 / KYC 表单填报专用格式
              </span>
              <button
                onClick={() => copy(`${roomFloor ? roomFloor + ', ' : ''}${line1}\n${line2}\n${city}, ${state} ${postcode}\n${country}`, 'bank_copy')}
                style={{
                  padding: '5px 12px',
                  background: copiedKey === 'bank_copy' ? '#10b981' : '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {copiedKey === 'bank_copy' ? '已复制全套 ✓' : '复制全套字段'}
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#334155', background: '#f0f9ff', padding: '10px 12px', borderRadius: '8px', lineHeight: '1.7' }}>
              <div><strong>Address Line 1:</strong> {roomFloor ? roomFloor + ', ' : ''}{line1}</div>
              <div><strong>Address Line 2:</strong> {line2}</div>
              <div><strong>City / State / Postcode:</strong> {city}, {state} {postcode}</div>
              <div><strong>Country:</strong> {country} ({countryCode})</div>
            </div>
          </div>

          {/* 场景 2：单行完整地址 (Stripe / OpenAI / Claude / AWS 绑卡 AVS 专用) */}
          <div
            style={{
              background: '#0f172a',
              color: '#f8fafc',
              borderRadius: '14px',
              padding: '18px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#93c5fd' }}>
                  💳 单行标准完整国际地址 (Stripe / 信用卡 AVS)
                </span>
                <span style={{ fontSize: '10px', background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  AVS READY
                </span>
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#f1f5f9',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '12px',
                  borderRadius: '8px',
                  wordBreak: 'break-all',
                  lineHeight: '1.6',
                }}
              >
                {finalFullAddress}
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => copy(finalFullAddress, 'single_full')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: copiedKey === 'single_full' ? '#10b981' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {copiedKey === 'single_full' ? '已复制完整地址 ✓' : '📋 一键复制完整国际地址'}
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalFullAddress)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#93c5fd',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                在 Google Maps 验证 ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressValidatorTool;
