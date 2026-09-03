import React, { useState } from 'react';

interface AddressFields {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  countryCode: string;
}

interface ValidationWarning {
  field: string;
  message: string;
  type: 'warning' | 'error' | 'tip';
}

const PRESET_TEMPLATES: { name: string; tag: string; raw: string; fields: AddressFields }[] = [
  {
    name: '中国大陆居民境外开户 (深圳高新园示例)',
    tag: '内地开户 / Wise',
    raw: '广东省深圳市南山区粤海街道高新南一道8号创维大厦18楼1801室',
    fields: {
      line1: 'Room 1801, 18/F, Skyworth Building',
      line2: 'No.8 Gaoxin South 1st Road, Yuehai, Nanshan',
      city: 'Shenzhen',
      state: 'Guangdong',
      postcode: '518057',
      country: 'China',
      countryCode: 'CN',
    },
  },
  {
    name: '香港核心商业区标准地址 (汇丰/中银开户)',
    tag: '香港本地银行',
    raw: '香港中环干诺道中1号友邦金融中心25楼2501室',
    fields: {
      line1: 'Suite 2501, 25/F, AIA Central',
      line2: 'No.1 Connaught Road Central',
      city: 'Hong Kong',
      state: 'Hong Kong',
      postcode: '999077',
      country: 'Hong Kong',
      countryCode: 'HK',
    },
  },
  {
    name: '美国免税州账单地址 (OpenAI / Claude / Stripe 专用)',
    tag: '美卡防风控 AVS',
    raw: '11832 SW Cedarcrest St, Portland, OR 97223, United States',
    fields: {
      line1: '11832 SW Cedarcrest St',
      line2: '',
      city: 'Portland',
      state: 'OR',
      postcode: '97223',
      country: 'United States',
      countryCode: 'US',
    },
  },
  {
    name: '澳门新口岸地址模版 (蚂蚁银行开户)',
    tag: '澳门离岸账户',
    raw: '澳门新口岸宋玉生广场263号中土大厦19楼',
    fields: {
      line1: '19/F, China Civil Plaza',
      line2: 'No.263 Alameda Dr. Carlos d\'Assumpcao',
      city: 'Macau',
      state: 'Macau',
      postcode: '999078',
      country: 'Macau',
      countryCode: 'MO',
    },
  },
];

// 常见中文地名/单位翻译对照
const DICT: Record<string, string> = {
  室: 'Room ',
  号: 'No.',
  楼: '/F',
  层: '/F',
  座: 'Block ',
  栋: 'Building ',
  大厦: ' Building',
  广场: ' Plaza',
  中心: ' Center',
  路: ' Road',
  街: ' Street',
  道: ' Avenue',
  巷: ' Lane',
  区: ' District',
  市: '',
  省: '',
  广东: 'Guangdong',
  北京: 'Beijing',
  上海: 'Shanghai',
  深圳: 'Shenzhen',
  广州: 'Guangzhou',
  浙江: 'Zhejiang',
  杭州: 'Hangzhou',
  江苏: 'Jiangsu',
  南京: 'Nanjing',
  香港: 'Hong Kong',
  澳门: 'Macau',
  中环: 'Central',
  南山: 'Nanshan',
  福田: 'Futian',
  朝阳: 'Chaoyang',
  海淀: 'Haidian',
  浦东: 'Pudong',
};

export const AddressValidatorTool: React.FC = () => {
  const [inputAddress, setInputAddress] = useState('广东省深圳市南山区粤海街道高新南一道8号创维大厦18楼1801室');
  const [fields, setFields] = useState<AddressFields>(PRESET_TEMPLATES[0].fields);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 智能格式化拆解
  const parseChineseAddress = (raw: string) => {
    setInputAddress(raw);
    const cleaned = raw.replace(/[，,]/g, ' ').trim();

    // 简单分词与规则推断
    let state = 'Guangdong';
    let city = 'Shenzhen';
    let postcode = '518000';
    let country = 'China';
    let countryCode = 'CN';

    if (cleaned.includes('香港')) {
      state = 'Hong Kong';
      city = 'Hong Kong';
      country = 'Hong Kong';
      countryCode = 'HK';
      postcode = '999077';
    } else if (cleaned.includes('澳门')) {
      state = 'Macau';
      city = 'Macau';
      country = 'Macau';
      countryCode = 'MO';
      postcode = '999078';
    } else if (cleaned.includes('北京')) {
      state = 'Beijing';
      city = 'Beijing';
      postcode = '100000';
    } else if (cleaned.includes('上海')) {
      state = 'Shanghai';
      city = 'Shanghai';
      postcode = '200000';
    } else if (cleaned.includes('广州')) {
      state = 'Guangdong';
      city = 'Guangzhou';
      postcode = '510000';
    } else if (cleaned.includes('杭州')) {
      state = 'Zhejiang';
      city = '杭州';
      postcode = '310000';
    }

    // 提取室/楼
    let roomMatch = cleaned.match(/(\d+)室/);
    let floorMatch = cleaned.match(/(\d+)[楼层]/);
    let line1Parts: string[] = [];
    if (roomMatch) line1Parts.push(`Room ${roomMatch[1]}`);
    if (floorMatch) line1Parts.push(`${floorMatch[1]}/F`);

    // 提取大厦/路
    let buildingMatch = cleaned.match(/([^省市区县街道]+(?:大厦|广场|中心|花园|小区|座|栋))/);
    if (buildingMatch) {
      line1Parts.push(buildingMatch[1]);
    }

    let line1 = line1Parts.join(', ') || cleaned.substring(0, 30);
    let line2 = cleaned.replace(new RegExp(line1Parts.join('|'), 'g'), '').trim();

    setFields({
      line1: line1 || 'Room 101, Building 1',
      line2: line2 || 'High-Tech Park',
      city,
      state,
      postcode,
      country,
      countryCode,
    });
  };

  // 严格合规检查
  const validateCompliance = (): ValidationWarning[] => {
    const warnings: ValidationWarning[] = [];

    // 1. 字符长度限制 (银行普遍限制 Line 1 ≤ 35 字符)
    if (fields.line1.length > 35) {
      warnings.push({
        field: 'Address Line 1',
        message: `当前长度为 ${fields.line1.length} 字符。多数国际银行（如汇丰/花旗）要求每行 ≤ 35 字符，超长建议拆分至 Line 2。`,
        type: 'warning',
      });
    }

    if (fields.line2.length > 35) {
      warnings.push({
        field: 'Address Line 2',
        message: `当前长度为 ${fields.line2.length} 字符，建议精简至 35 字符以内。`,
        type: 'warning',
      });
    }

    // 2. 特殊字符检查
    const specialCharRegex = /[#%^*<>{}\\]/;
    if (specialCharRegex.test(fields.line1) || specialCharRegex.test(fields.line2)) {
      warnings.push({
        field: '特殊字符',
        message: '地址中包含 # 或 % 等特殊符号，部分海外银行结算系统可能会乱码，建议替换为 No. 或直接用数字。',
        type: 'error',
      });
    }

    // 3. 香港邮编提示
    if ((fields.countryCode === 'HK' || fields.city.toLowerCase().includes('hong kong')) && !['999077', '000000', 'HK'].includes(fields.postcode)) {
      warnings.push({
        field: '邮政编码',
        message: '香港本地实际没有邮政编码。国际系统（如 Stripe/Wise）要求必填时，请统一填写 999077 或 000000。',
        type: 'tip',
      });
    }

    // 4. 邮编非空提示
    if (!fields.postcode.trim()) {
      warnings.push({
        field: 'Postal Code',
        message: '邮政编码为空！绑定境外信用卡（如 OpenAI/AWS）若无邮编会导致 AVS 验证直接失败。',
        type: 'error',
      });
    }

    return warnings;
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const fullAddress = [fields.line1, fields.line2, fields.city, fields.state, fields.postcode, fields.country]
    .filter(Boolean)
    .join(', ');

  const warnings = validateCompliance();

  return (
    <div
      style={{
        background: 'var(--dumi-default-color-bg, #ffffff)',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 12,
        padding: '24px',
        margin: '24px 0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      {/* 预设场景快捷选择 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#666', marginBottom: 8 }}>
          ⚡ 快速载入真实出海模板：
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRESET_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputAddress(tmpl.raw);
                setFields(tmpl.fields);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #1677ff',
                background: fields.countryCode === tmpl.fields.countryCode && fields.line1 === tmpl.fields.line1 ? '#1677ff' : '#e6f4ff',
                color: fields.countryCode === tmpl.fields.countryCode && fields.line1 === tmpl.fields.line1 ? '#ffffff' : '#1677ff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* 中文原始地址输入 */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
          📝 输入或粘贴你的中文/原始地址（支持自动解析与分词）：
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            placeholder="例如：广东省深圳市南山区粤海街道高新南一道8号创维大厦18楼1801室"
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              fontSize: 14,
              outline: 'none',
            }}
          />
          <button
            onClick={() => parseChineseAddress(inputAddress)}
            style={{
              padding: '10px 20px',
              background: '#1677ff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            智能格式化
          </button>
        </div>
      </div>

      {/* 银行标准 6 字段拆解与手动精调 */}
      <div
        style={{
          background: 'rgba(0,0,0,0.02)',
          borderRadius: 8,
          padding: 18,
          border: '1px solid rgba(0,0,0,0.06)',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>
            📋 国际银行/Wise/Stripe 标准开户字段拆解（支持直接编辑微调）：
          </span>
          <span style={{ fontSize: 12, color: '#52c41a' }}>● 倒序国际格式就绪</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {[
            { label: 'Address Line 1 (门牌/房间/建筑, ≤35字)', key: 'line1', val: fields.line1 },
            { label: 'Address Line 2 (街道/区域/备用, ≤35字)', key: 'line2', val: fields.line2 },
            { label: 'City (城市英文/拼音)', key: 'city', val: fields.city },
            { label: 'State / Province (省份/州)', key: 'state', val: fields.state },
            { label: 'Postal / ZIP Code (邮政编码, 必填)', key: 'postcode', val: fields.postcode },
            { label: 'Country / Code (国家与ISO代码)', key: 'country', val: `${fields.country} (${fields.countryCode})` },
          ].map((item) => (
            <div
              key={item.key}
              style={{
                background: 'var(--dumi-default-color-bg, #ffffff)',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: '#888' }}>{item.label}</span>
                <span style={{ fontSize: 11, color: item.val.length > 35 ? '#ff4d4f' : '#aaa' }}>
                  {item.val.length} 字符
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  value={fields[item.key as keyof AddressFields] || ''}
                  onChange={(e) => setFields({ ...fields, [item.key]: e.target.value })}
                  style={{
                    flex: 1,
                    border: '1px solid #f0f0f0',
                    borderRadius: 4,
                    padding: '4px 8px',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                />
                <button
                  onClick={() => copyToClipboard(fields[item.key as keyof AddressFields], item.key)}
                  style={{
                    padding: '4px 8px',
                    fontSize: 12,
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    background: '#fafafa',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copiedKey === item.key ? '已复制' : '复制'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 完整英文拼接与一键复制 */}
        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            background: 'var(--dumi-default-color-bg, #ffffff)',
            borderRadius: 6,
            border: '1px solid #1677ff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>
              Full International Formatted Address (单行完整国际地址)
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1677ff', wordBreak: 'break-all' }}>
              {fullAddress}
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(fullAddress, 'full')}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              border: 'none',
              color: '#fff',
              borderRadius: 6,
              background: '#1677ff',
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {copiedKey === 'full' ? '已复制全部' : '一键复制完整地址'}
          </button>
        </div>
      </div>

      {/* 智能合规风控诊断报告 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          🛡️ 国际银行 / AVS 账单风控自检诊断：
        </div>
        {warnings.length === 0 ? (
          <div
            style={{
              padding: '10px 14px',
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              color: '#52c41a',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            ✅ 格式完美！已通过字符长度校验 (≤35字)、特殊符号过滤与国际邮编规范，可放心提交银行 KYC 或 Stripe 绑定。
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {warnings.map((w, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 13,
                  background: w.type === 'error' ? '#fff2f0' : w.type === 'warning' ? '#fffbe6' : '#e6f4ff',
                  border: `1px solid ${w.type === 'error' ? '#ffccc7' : w.type === 'warning' ? '#ffe58f' : '#91caff'}`,
                  color: w.type === 'error' ? '#ff4d4f' : w.type === 'warning' ? '#d48806' : '#0958d9',
                }}
              >
                {w.type === 'error' ? '🚫' : w.type === 'warning' ? '⚠️' : '💡'} <strong>[{w.field}]</strong> {w.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Google Maps / Apple Maps 快速双向验证链接 */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px dashed #eee' }}>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: '#1677ff',
            textDecoration: 'none',
            padding: '6px 12px',
            background: 'rgba(22,119,255,0.06)',
            borderRadius: 4,
          }}
        >
          📍 在 Google Maps 真实验证地理位置 ↗
        </a>
        <a
          href={`https://maps.apple.com/?q=${encodeURIComponent(fullAddress)}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: '#666',
            textDecoration: 'none',
            padding: '6px 12px',
            background: 'rgba(0,0,0,0.04)',
            borderRadius: 4,
          }}
        >
          🗺️ 在 Apple Maps 验证 ↗
        </a>
      </div>
    </div>
  );
};

export default AddressValidatorTool;
