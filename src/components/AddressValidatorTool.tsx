import React, { useState } from 'react';

interface Preset {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  desc: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  countryCode: string;
  recipient?: string;
  phone?: string;
}

const PRESETS: Preset[] = [
  {
    id: 'hk_bank',
    title: '🇭🇰 香港银行开户 (汇丰 / 中银 / ZA)',
    badge: '离岸 KYC 首选',
    badgeColor: '#059669',
    desc: '适用于香港各大零售与虚拟银行开户证明、投资账户登记。',
    line1: 'Flat B, 18/F, Tower 1, AIA Central',
    line2: 'No.1 Connaught Road Central',
    city: 'Hong Kong',
    state: 'Hong Kong Island',
    postcode: '999077',
    country: 'Hong Kong',
    countryCode: 'HK',
  },
  {
    id: 'us_tax_free',
    title: '🇺🇸 美国免税州账单 (OpenAI / Claude / Stripe)',
    badge: '0% 消费税 / 避 AVS 拦截',
    badgeColor: '#2563EB',
    desc: '俄勒冈州 (Oregon) 真实商用免税地址，有效防止绑卡风控拒付。',
    line1: '11832 SW Cedarcrest St',
    line2: 'Suite 200',
    city: 'Portland',
    state: 'OR',
    postcode: '97223',
    country: 'United States',
    countryCode: 'US',
  },
  {
    id: 'cn_offshore',
    title: '🇨🇳 大陆居民出海标准格式 (深圳高新园)',
    badge: '内地居民 KYC',
    badgeColor: '#D97706',
    desc: '国内地址翻译至国际标准倒序（室-楼-栋-路-区-市-省）。',
    line1: 'Room 1801, 18/F, Skyworth Building',
    line2: 'No.8 Gaoxin South 1st Road, Yuehai, Nanshan',
    city: 'Shenzhen',
    state: 'Guangdong',
    postcode: '518057',
    country: 'China',
    countryCode: 'CN',
  },
  {
    id: 'sg_ocbc',
    title: '🇸🇬 新加坡华侨银行 (OCBC 360 / 远程开户)',
    badge: '东南亚金融枢纽',
    badgeColor: '#7C3AED',
    desc: '新加坡合规标准地址格式，邮编 6 位数精准对应建筑定位。',
    line1: '65 Chulia Street',
    line2: '#28-00 OCBC Centre',
    city: 'Singapore',
    state: 'Singapore',
    postcode: '049513',
    country: 'Singapore',
    countryCode: 'SG',
  },
];

export const AddressValidatorTool: React.FC = () => {
  const [activePreset, setActivePreset] = useState<string>('hk_bank');
  const [fields, setFields] = useState<Preset>(PRESETS[0]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSelectPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setFields(preset);
  };

  const copyText = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const fullAddress = [
    fields.line1,
    fields.line2,
    fields.city,
    fields.state,
    fields.postcode,
    fields.country,
  ]
    .filter(Boolean)
    .join(', ');

  // 严格字符长度校验 (国际银行 Line 1 标准一般上限 35 字符)
  const line1Len = fields.line1.length;
  const line2Len = fields.line2.length;
  const isLine1Safe = line1Len <= 35;
  const isLine2Safe = line2Len <= 35;

  return (
    <div style={{ margin: '28px 0', fontFamily: 'inherit' }}>
      {/* 顶部极简场景切换胶囊 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        {PRESETS.map((p) => {
          const isActive = activePreset === p.id;
          return (
            <div
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              style={{
                background: isActive
                  ? 'rgba(37, 99, 235, 0.06)'
                  : 'var(--dumi-default-color-bg, #ffffff)',
                border: isActive
                  ? '1.5px solid #2563eb'
                  : '1px solid rgba(0,0,0,0.08)',
                borderRadius: '10px',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: isActive
                  ? '0 4px 12px rgba(37, 99, 235, 0.12)'
                  : '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: isActive ? '#1e40af' : 'inherit' }}>
                  {p.title}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                {p.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* 主操作区：左侧编辑拆解 + 右侧拟真开户预览卡片 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          background: 'var(--dumi-default-color-bg, #ffffff)',
          border: '1px solid rgba(0,0,0,0.09)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
        }}
      >
        {/* 左侧：表单化精准字段编辑 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.2px' }}>
              ⚙️ 国际标准字段拆解
            </span>
            <span style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
              ● 格式合规
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Address Line 1 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <label style={{ fontWeight: 600, color: '#334155' }}>
                  Address Line 1 <span style={{ color: '#94a3b8', fontWeight: 400 }}>(门牌/大厦/房间)</span>
                </label>
                <span style={{ fontSize: '11px', color: isLine1Safe ? '#64748b' : '#ef4444', fontWeight: isLine1Safe ? 400 : 700 }}>
                  {line1Len}/35 字符 {isLine1Safe ? '' : '⚠️ 超长'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={fields.line1}
                  onChange={(e) => setFields({ ...fields, line1: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${isLine1Safe ? 'rgba(0,0,0,0.12)' : '#f87171'}`,
                    fontSize: '13px',
                    outline: 'none',
                    background: 'transparent',
                  }}
                />
                <button
                  onClick={() => copyText(fields.line1, 'line1')}
                  style={{
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: copiedField === 'line1' ? '#10b981' : 'rgba(0,0,0,0.03)',
                    color: copiedField === 'line1' ? '#fff' : '#475569',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {copiedField === 'line1' ? '✓' : '复制'}
                </button>
              </div>
            </div>

            {/* Address Line 2 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <label style={{ fontWeight: 600, color: '#334155' }}>
                  Address Line 2 <span style={{ color: '#94a3b8', fontWeight: 400 }}>(路名/街区/备用)</span>
                </label>
                <span style={{ fontSize: '11px', color: isLine2Safe ? '#64748b' : '#ef4444' }}>
                  {line2Len}/35 字符
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={fields.line2}
                  onChange={(e) => setFields({ ...fields, line2: e.target.value })}
                  placeholder="可留空或填街道"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${isLine2Safe ? 'rgba(0,0,0,0.12)' : '#f87171'}`,
                    fontSize: '13px',
                    outline: 'none',
                    background: 'transparent',
                  }}
                />
                <button
                  onClick={() => copyText(fields.line2, 'line2')}
                  style={{
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: copiedField === 'line2' ? '#10b981' : 'rgba(0,0,0,0.03)',
                    color: copiedField === 'line2' ? '#fff' : '#475569',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {copiedField === 'line2' ? '✓' : '复制'}
                </button>
              </div>
            </div>

            {/* City & State 并排 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  City (城市)
                </label>
                <input
                  type="text"
                  value={fields.city}
                  onChange={(e) => setFields({ ...fields, city: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: '13px',
                    outline: 'none',
                    background: 'transparent',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  State / Province (州/省)
                </label>
                <input
                  type="text"
                  value={fields.state}
                  onChange={(e) => setFields({ ...fields, state: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: '13px',
                    outline: 'none',
                    background: 'transparent',
                  }}
                />
              </div>
            </div>

            {/* ZIP & Country Code 并排 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Postal / ZIP Code (邮编)
                </label>
                <input
                  type="text"
                  value={fields.postcode}
                  onChange={(e) => setFields({ ...fields, postcode: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: '13px',
                    outline: 'none',
                    fontWeight: 700,
                    color: '#2563eb',
                    background: 'transparent',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Country (国家代码)
                </label>
                <input
                  type="text"
                  value={`${fields.country} (${fields.countryCode})`}
                  readOnly
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: '13px',
                    background: 'rgba(0,0,0,0.03)',
                    color: '#64748b',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：拟真国际金融账单 / 开户证明卡片 (Live Digital Card) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '14px',
            padding: '22px',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 装饰水印 */}
          <div
            style={{
              position: 'absolute',
              right: '-15px',
              bottom: '-15px',
              fontSize: '110px',
              opacity: 0.04,
              fontWeight: 900,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            KYC
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                VERIFIED BILLING PROFILE
              </span>
              <span style={{ fontSize: '10px', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                AVS READY
              </span>
            </div>

            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Formatted Full Address
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: '1.6',
                color: '#e2e8f0',
                wordBreak: 'break-word',
                background: 'rgba(255,255,255,0.05)',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                marginBottom: '16px',
              }}
            >
              {fullAddress}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>CITY / POSTCODE</span>
                <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{fields.city}, {fields.postcode}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>JURISDICTION</span>
                <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{fields.country}</span>
              </div>
            </div>
          </div>

          {/* 底部一键复制卡片按钮与地图联动 */}
          <div style={{ marginTop: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => copyText(fullAddress, 'full')}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: copiedField === 'full' ? '#10b981' : '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s',
              }}
            >
              {copiedField === 'full' ? '✓ 完整英文地址已复制' : '📋 一键复制完整国际地址'}
            </button>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                textAlign: 'center',
                fontSize: '11px',
                color: '#94a3b8',
                textDecoration: 'none',
                padding: '4px',
              }}
            >
              在 Google Maps 卫星地图中校验真实位置 ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressValidatorTool;
