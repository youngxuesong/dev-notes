import React, { useState, useEffect, useRef } from 'react';

interface ParsedAddress {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  countryCode: string;
  formattedAddress: string;
  lat: string;
  lon: string;
  displayName: string;
}

export const AddressValidatorTool: React.FC = () => {
  const [query, setQuery] = useState('香港中环干诺道中1号');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedAddress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // 初始化地图 (动态加载 Leaflet 以免 SSR 报错)
  const initMap = (lat: number, lon: number, label: string) => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = () => {
      // @ts-ignore
      const L = window.L;
      if (!L || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current).setView([lat, lon], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
        }).addTo(mapInstanceRef.current);

        // 监听地图点击，支持反向选点
        mapInstanceRef.current.on('click', async (e: any) => {
          const clickLat = e.latlng.lat;
          const clickLon = e.latlng.lng;
          await reverseGeocode(clickLat, clickLon);
        });
      } else {
        mapInstanceRef.current.setView([lat, lon], 16);
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      } else {
        markerRef.current = L.marker([lat, lon]).addTo(mapInstanceRef.current);
      }
      markerRef.current.bindPopup(label).openPopup();
    };

    // @ts-ignore
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = loadLeaflet;
      document.body.appendChild(script);
    } else {
      loadLeaflet();
    }
  };

  const parseNominatimData = (item: any): ParsedAddress => {
    const addr = item.address || {};
    const road = addr.road || addr.pedestrian || addr.street || addr.neighbourhood || '';
    const houseNumber = addr.house_number || '';
    const suburb = addr.suburb || addr.district || '';
    const city = addr.city || addr.town || addr.municipality || addr.county || addr.city_district || '';
    const state = addr.state || addr.province || addr.region || '';
    const postcode = addr.postcode || '';
    const country = addr.country || '';
    const countryCode = (addr.country_code || '').toUpperCase();

    const line1 = [houseNumber, road].filter(Boolean).join(' ') || item.name || '';
    const line2 = suburb || '';

    const englishParts = [line1, line2, city, state, postcode, country].filter(Boolean);
    const formatted = englishParts.join(', ');

    return {
      addressLine1: line1 || item.display_name.split(',')[0],
      addressLine2: line2,
      city: city || state,
      state: state || city,
      postcode: postcode || 'N/A',
      country: country,
      countryCode: countryCode,
      formattedAddress: formatted || item.display_name,
      lat: item.lat,
      lon: item.lon,
      displayName: item.display_name,
    };
  };

  const handleSearch = async (searchTerm?: string) => {
    const q = searchTerm || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q,
        )}&addressdetails=1&limit=1`,
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const parsed = parseNominatimData(data[0]);
        setResult(parsed);
        initMap(parseFloat(parsed.lat), parseFloat(parsed.lon), parsed.addressLine1);
      } else {
        setError('未找到该地址的精确地理位置，请尝试补充路名、门牌号或所在城市重新搜索。');
      }
    } catch (err: any) {
      setError('地址查询超时或网络错误，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      );
      const data = await res.json();
      if (data && data.address) {
        const parsed = parseNominatimData(data);
        setResult(parsed);
        setQuery(data.display_name);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lon]).bindPopup(parsed.addressLine1).openPopup();
        }
      }
    } catch (err) {
      // 静默处理
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch('香港中环干诺道中1号');
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div
      style={{
        background: 'var(--dumi-default-color-bg, #ffffff)',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 12,
        padding: '24px',
        margin: '24px 0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 15 }}>
          🔍 输入待验证的地址（支持中文、拼音或英文）：
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="例如：香港中环干诺道中1号 或 深圳市南山区科技园"
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid #ccc',
              borderRadius: 6,
              fontSize: 14,
              outline: 'none',
            }}
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#1677ff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {loading ? '解析中...' : '核验与定位'}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '10px 14px',
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            color: '#ff4d4f',
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* 地图交互区域 */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: 320,
          borderRadius: 8,
          marginBottom: 20,
          border: '1px solid rgba(0,0,0,0.1)',
          background: '#f5f5f5',
          zIndex: 1,
        }}
      />
      <div style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
        💡 提示：可以在地图上直接点击任意位置，自动反向推演该地点的标准出海英文地址格式。
      </div>

      {/* 结构化开户格式拆解 */}
      {result && (
        <div
          style={{
            background: 'rgba(0,0,0,0.02)',
            borderRadius: 8,
            padding: 18,
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>📋 跨境银行 / Wise / Stripe 国际标准开户格式拆解：</span>
            <span style={{ fontSize: 12, color: '#52c41a', fontWeight: 'normal' }}>
              ● 地理编码核验通过 (经度: {parseFloat(result.lon).toFixed(4)}, 纬度: {parseFloat(result.lat).toFixed(4)})
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {[
              { label: 'Address Line 1 (街道/门牌)', val: result.addressLine1, key: 'line1' },
              { label: 'Address Line 2 (区/楼栋/备用)', val: result.addressLine2 || '(可留空)', key: 'line2' },
              { label: 'City (城市)', val: result.city, key: 'city' },
              { label: 'State / Province (省/州)', val: result.state, key: 'state' },
              { label: 'Postal / ZIP Code (邮政编码)', val: result.postcode, key: 'zip' },
              { label: 'Country Code (国家代码)', val: result.countryCode, key: 'countryCode' },
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  background: 'var(--dumi-default-color-bg, #ffffff)',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.val}</div>
                </div>
                {item.val && item.val !== '(可留空)' && (
                  <button
                    onClick={() => copyToClipboard(item.val, item.key)}
                    style={{
                      padding: '4px 8px',
                      fontSize: 12,
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                      background: '#fafafa',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedKey === item.key ? '已复制' : '复制'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 完整拼接地址 */}
          <div
            style={{
              marginTop: 14,
              padding: '10px 12px',
              background: 'var(--dumi-default-color-bg, #ffffff)',
              borderRadius: 6,
              border: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Full Formatted English Address (完整国际英文地址)</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1677ff' }}>{result.formattedAddress}</div>
            </div>
            <button
              onClick={() => copyToClipboard(result.formattedAddress, 'full')}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                border: '1px solid #1677ff',
                color: '#1677ff',
                borderRadius: 4,
                background: '#e6f4ff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {copiedKey === 'full' ? '已复制' : '一键复制完整地址'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressValidatorTool;
