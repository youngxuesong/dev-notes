import React, { useState, useEffect } from 'react';

// 常见行政区划与拼音/英文映射库
const REGION_DATA: Record<string, { pinyin: string; en?: string; province: string; provPinyin: string; postcode: string }> = {
  北京: { pinyin: 'Beijing', province: '北京', provPinyin: 'Beijing', postcode: '100000' },
  上海: { pinyin: 'Shanghai', province: '上海', provPinyin: 'Shanghai', postcode: '200000' },
  天津: { pinyin: 'Tianjin', province: '天津', provPinyin: 'Tianjin', postcode: '300000' },
  重庆: { pinyin: 'Chongqing', province: '重庆', provPinyin: 'Chongqing', postcode: '400000' },
  深圳: { pinyin: 'Shenzhen', province: '广东', provPinyin: 'Guangdong', postcode: '518000' },
  广州: { pinyin: 'Guangzhou', province: '广东', provPinyin: 'Guangdong', postcode: '510000' },
  杭州: { pinyin: 'Hangzhou', province: '浙江', provPinyin: 'Zhejiang', postcode: '310000' },
  宁波: { pinyin: 'Ningbo', province: '浙江', provPinyin: 'Zhejiang', postcode: '315000' },
  南京: { pinyin: 'Nanjing', province: '江苏', provPinyin: 'Jiangsu', postcode: '210000' },
  苏州: { pinyin: 'Suzhou', province: '江苏', provPinyin: 'Jiangsu', postcode: '215000' },
  成都: { pinyin: 'Chengdu', province: '四川', provPinyin: 'Sichuan', postcode: '610000' },
  武汉: { pinyin: 'Wuhan', province: '湖北', provPinyin: 'Hubei', postcode: '430000' },
  西安: { pinyin: 'Xi\'an', province: '陕西', provPinyin: 'Shaanxi', postcode: '710000' },
  厦门: { pinyin: 'Xiamen', province: '福建', provPinyin: 'Fujian', postcode: '361000' },
  福州: { pinyin: 'Fuzhou', province: '福建', provPinyin: 'Fujian', postcode: '350000' },
  长沙: { pinyin: 'Changsha', province: '湖南', provPinyin: 'Hunan', postcode: '410000' },
  青岛: { pinyin: 'Qingdao', province: '山东', provPinyin: 'Shandong', postcode: '266000' },
  济南: { pinyin: 'Jinan', province: '山东', provPinyin: 'Shandong', postcode: '250000' },
  合肥: { pinyin: 'Hefei', province: '安徽', provPinyin: 'Anhui', postcode: '230000' },
  郑州: { pinyin: 'Zhengzhou', province: '河南', provPinyin: 'Henan', postcode: '450000' },
  东莞: { pinyin: 'Dongguan', province: '广东', provPinyin: 'Guangdong', postcode: '523000' },
  佛山: { pinyin: 'Foshan', province: '广东', provPinyin: 'Guangdong', postcode: '528000' },
  珠海: { pinyin: 'Zhuhai', province: '广东', provPinyin: 'Guangdong', postcode: '519000' },
  香港: { pinyin: 'Hong Kong', en: 'Hong Kong', province: 'Hong Kong', provPinyin: 'Hong Kong', postcode: '999077' },
  中环: { pinyin: 'Central', en: 'Central', province: 'Hong Kong', provPinyin: 'Hong Kong', postcode: '999077' },
  湾仔: { pinyin: 'Wan Chai', en: 'Wan Chai', province: 'Hong Kong', provPinyin: 'Hong Kong', postcode: '999077' },
  铜锣湾: { pinyin: 'Causeway Bay', en: 'Causeway Bay', province: 'Hong Kong', provPinyin: 'Hong Kong', postcode: '999077' },
  尖沙咀: { pinyin: 'Tsim Sha Tsui', en: 'Tsim Sha Tsui', province: 'Hong Kong', provPinyin: 'Hong Kong', postcode: '999077' },
  澳门: { pinyin: 'Macau', en: 'Macau', province: 'Macau', provPinyin: 'Macau', postcode: '999078' },
};

// 预设高频免税州/香港商业真实地址（用于直接绑卡与开户参考）
const READY_MADE_ADDRESSES = [
  {
    name: '🇺🇸 美国俄勒冈 (Oregon) 免税州账单',
    tag: 'OpenAI / Claude / Stripe 0%消费税防风控',
    line1: '11832 SW Cedarcrest St',
    line2: 'Suite 200',
    city: 'Portland',
    state: 'OR',
    zip: '97223',
    country: 'United States',
    countryCode: 'US',
    phone: '+1 (503) 555-0192',
  },
  {
    name: '🇺🇸 美国特拉华 (Delaware) 商业免税州',
    tag: 'Stripe Atlas / 美国公司注册与绑卡',
    line1: '1201 N Orange St',
    line2: 'Suite 700',
    city: 'Wilmington',
    state: 'DE',
    zip: '19801',
    country: 'United States',
    countryCode: 'US',
    phone: '+1 (302) 555-0143',
  },
  {
    name: '🇭🇰 香港汇丰/中银 开户常用商业地址',
    tag: '香港离岸银行官方标准',
    line1: 'Flat B, 18/F, Tower 1, AIA Central',
    line2: 'No.1 Connaught Road Central',
    city: 'Hong Kong',
    state: 'Hong Kong Island',
    zip: '999077',
    country: 'Hong Kong',
    countryCode: 'HK',
    phone: '+852 2823 8888',
  },
  {
    name: '🇸🇬 新加坡 OCBC / Wise 东南亚枢纽',
    tag: '华侨银行 / 新加坡数字账户',
    line1: '65 Chulia Street',
    line2: '#28-00 OCBC Centre',
    city: 'Singapore',
    state: 'Singapore',
    zip: '049513',
    country: 'Singapore',
    countryCode: 'SG',
    phone: '+65 6538 1111',
  },
];

export const AddressValidatorTool: React.FC = () => {
  const [tab, setTab] = useState<'convert' | 'templates'>('convert');
  const [rawInput, setRawInput] = useState(
    '张小明，13812345678，广东省深圳市南山区粤海街道高新南一道8号创维大厦18楼1801室',
  );

  // 解析拆解状态
  const [name, setName] = useState('Zhang Xiaoming');
  const [phone, setPhone] = useState('+86 13812345678');
  const [line1, setLine1] = useState('Room 1801, 18/F, Skyworth Building');
  const [line2, setLine2] = useState('No.8 Gaoxin South 1st Road, Yuehai, Nanshan');
  const [city, setCity] = useState('Shenzhen');
  const [state, setState] = useState('Guangdong');
  const [postcode, setPostcode] = useState('518057');
  const [country, setCountry] = useState('China');
  const [countryCode, setCountryCode] = useState('CN');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 核心智能解析算法（自动清洗手机号、姓名、层级倒序）
  const parseAddress = (text: string) => {
    let clean = text.trim();
    if (!clean) return;

    // 1. 提取手机号 (11位大陆手机或固定电话)
    const phoneMatch = clean.match(/(1[3-9]\d{9}|\+?86[- ]?1[3-9]\d{9})/);
    let extractedPhone = '+86 ';
    if (phoneMatch) {
      const num = phoneMatch[0].replace(/\D/g, '').slice(-11);
      extractedPhone = `+86 ${num}`;
      clean = clean.replace(phoneMatch[0], ' ');
    }
    setPhone(extractedPhone);

    // 2. 提取姓名（匹配常见中文分隔或首部字符）
    const nameMatch = clean.match(/^([\u4e00-\u9fa5]{2,4})[，,\s]/);
    if (nameMatch) {
      clean = clean.replace(nameMatch[0], ' ');
    }

    // 3. 识别城市和省份
    let detectedCity = 'Shenzhen';
    let detectedState = 'Guangdong';
    let detectedZip = '518000';
    let detectedCountry = 'China';
    let detectedCountryCode = 'CN';

    for (const [k, v] of Object.entries(REGION_DATA)) {
      if (clean.includes(k)) {
        detectedCity = v.en || v.pinyin;
        detectedState = v.provPinyin;
        detectedZip = v.postcode;
        if (k === '香港' || k === '中环' || k === '湾仔' || k === '尖沙咀') {
          detectedCountry = 'Hong Kong';
          detectedCountryCode = 'HK';
        } else if (k === '澳门') {
          detectedCountry = 'Macau';
          detectedCountryCode = 'MO';
        }
        break;
      }
    }

    // 4. 清理省市区关键词，提取核心门牌/大厦/房间
    let detail = clean
      .replace(/中国|广东省|广东|北京市|北京|上海市|上海|浙江省|浙江|江苏省|江苏|四川省|四川|湖北省|湖北|陕西省|陕西|福建省|福建|山东省|山东|河南省|河南|香港特别行政区|香港|澳门特别行政区|澳门/g, '')
      .replace(/深圳市|广州市|成都市|杭州市|南京市|武汉市|西安市|厦门市|青岛市|宁波市|苏州市|东莞市|佛山市|珠海市/g, '')
      .replace(/[，,]/g, ' ')
      .trim();

    // 提取室 / 单元 / 楼层
    const roomMatch = detail.match(/(\d+)\s*室/);
    const floorMatch = detail.match(/(\d+)\s*[楼层Ff]/);
    const unitMatch = detail.match(/(\d+)\s*单元/);
    const blockMatch = detail.match(/([A-Za-z0-9\u4e00-\u9fa5]+)\s*[座栋幢号楼]/);

    const l1Parts: string[] = [];
    if (roomMatch) {
      l1Parts.push(`Room ${roomMatch[1]}`);
      detail = detail.replace(roomMatch[0], '');
    }
    if (floorMatch) {
      l1Parts.push(`${floorMatch[1]}/F`);
      detail = detail.replace(floorMatch[0], '');
    }
    if (unitMatch) {
      l1Parts.push(`Unit ${unitMatch[1]}`);
      detail = detail.replace(unitMatch[0], '');
    }

    // 提取建筑名称
    const bldgMatch = detail.match(/([\u4e00-\u9fa5A-Za-z0-9]+(?:大厦|中心|广场|花园|大厦|小区|园区|公寓|城|府|苑))/);
    let buildingName = '';
    if (bldgMatch) {
      buildingName = bldgMatch[1];
      detail = detail.replace(bldgMatch[0], '');
    }

    // 提取路名和门牌号
    const roadMatch = detail.match(/([\u4e00-\u9fa50-9]+(?:路|街|道|巷|大道))\s*(\d+)?号?/);
    let roadName = '';
    if (roadMatch) {
      roadName = roadMatch[0];
      detail = detail.replace(roadMatch[0], '');
    }

    const finalL1 = [...l1Parts, buildingName].filter(Boolean).join(', ') || detail.slice(0, 30);
    const finalL2 = [roadName, detail.trim()].filter(Boolean).join(', ');

    setLine1(finalL1 || 'Room 101, Building 1');
    setLine2(finalL2 || 'High-Tech Park');
    setCity(detectedCity);
    setState(detectedState);
    setPostcode(detectedZip);
    setCountry(detectedCountry);
    setCountryCode(detectedCountryCode);
  };

  useEffect(() => {
    parseAddress(rawInput);
  }, []);

  const copy = (txt: string, key: string) => {
    if (!txt) return;
    navigator.clipboard.writeText(txt);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const fullAddress = [line1, line2, city, state, postcode, country].filter(Boolean).join(', ');

  return (
    <div style={{ margin: '24px 0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* 顶部主选项卡 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        <button
          onClick={() => setTab('convert')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            background: tab === 'convert' ? '#0f172a' : 'transparent',
            color: tab === 'convert' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          🔄 粘贴中文地址 → 一键转国际开户标准格式
        </button>
        <button
          onClick={() => setTab('templates')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            background: tab === 'templates' ? '#0f172a' : 'transparent',
            color: tab === 'templates' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          🇺🇸 现成免税州 & 常用离岸开户真实地址库
        </button>
      </div>

      {tab === 'convert' ? (
        <div>
          {/* 输入框区域 */}
          <div
            style={{
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
                📋 粘贴你的中文地址（支持从微信/顺丰/淘宝直接整段粘贴）：
              </label>
              <button
                onClick={() => {
                  setRawInput('广东省深圳市南山区粤海街道高新南一道8号创维大厦18楼1801室');
                  parseAddress('广东省深圳市南山区粤海街道高新南一道8号创维大厦18楼1801室');
                }}
                style={{ fontSize: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                填入深圳示范地址
              </button>
            </div>
            <textarea
              rows={3}
              value={rawInput}
              onChange={(e) => {
                setRawInput(e.target.value);
                parseAddress(e.target.value);
              }}
              placeholder="例如：张三，13800000000，北京市朝阳区建国门外大街1号国贸大厦A座28楼2801室"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                lineHeight: '1.5',
                outline: 'none',
                background: '#ffffff',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
              <span>💡 自动识别手机号、省市区、街道门牌、房间楼层，并按国际标准逆序拼装。</span>
              <button
                onClick={() => parseAddress(rawInput)}
                style={{
                  padding: '6px 14px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                重新解析
              </button>
            </div>
          </div>

          {/* 核心输出矩阵：左侧独立表单 + 右侧各大机构一键复制卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px' }}>
            {/* 左侧：可微调的字段表单 */}
            <div
              style={{
                background: 'var(--dumi-default-color-bg, #ffffff)',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '14px' }}>
                ✏️ 拆解字段（支持手动二次微调）
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>
                    <span>Address Line 1 (房号/大厦/门牌)</span>
                    <span style={{ color: line1.length > 35 ? '#ef4444' : '#64748b', fontWeight: line1.length > 35 ? 700 : 400 }}>
                      {line1.length}/35字 {line1.length > 35 && '(⚠️超长建议拆至Line 2)'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        fontSize: '13px',
                        border: `1px solid ${line1.length > 35 ? '#f87171' : '#cbd5e1'}`,
                        borderRadius: '6px',
                      }}
                    />
                    <button
                      onClick={() => copy(line1, 'l1')}
                      style={{ padding: '0 10px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc', cursor: 'pointer' }}
                    >
                      {copiedKey === 'l1' ? '已复制' : '复制'}
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>
                    <span>Address Line 2 (路名/街道/区)</span>
                    <span>{line2.length}/35字</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      style={{ flex: 1, padding: '7px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                    <button
                      onClick={() => copy(line2, 'l2')}
                      style={{ padding: '0 10px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc', cursor: 'pointer' }}
                    >
                      {copiedKey === 'l2' ? '已复制' : '复制'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>City (城市)</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>State (省/特区)</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>Postal Code (邮编)</label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, color: '#2563eb' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>Country Code (国家)</label>
                    <input
                      type="text"
                      value={`${country} (${countryCode})`}
                      readOnly
                      style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc', color: '#64748b' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：出海各大场景即用输出卡片 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 场景 1：香港发钞行/虚拟银行 KYC 填表格式 */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #0284c7',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#0369a1' }}>
                    🏦 境外银行 KYC 专用格式 (汇丰 / 中银 / ZA Bank)
                  </span>
                  <button
                    onClick={() => copy(`${line1}\n${line2}\n${city}, ${state} ${postcode}\n${country}`, 'bank_copy')}
                    style={{
                      padding: '4px 10px',
                      background: copiedKey === 'bank_copy' ? '#10b981' : '#0284c7',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    {copiedKey === 'bank_copy' ? '已复制' : '复制全套'}
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: '#334155', background: '#f0f9ff', padding: '8px 10px', borderRadius: '6px', lineHeight: '1.6' }}>
                  <div><strong>Line 1:</strong> {line1}</div>
                  <div><strong>Line 2:</strong> {line2}</div>
                  <div><strong>City / State / Zip:</strong> {city}, {state} {postcode}</div>
                  <div><strong>Country:</strong> {country}</div>
                </div>
              </div>

              {/* 场景 2：单行完整地址 (Stripe / OpenAI / Claude / AWS 绑卡) */}
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
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#93c5fd' }}>
                    💳 单行标准完整国际地址 (Stripe / 信用卡 AVS)
                  </span>
                  <button
                    onClick={() => copy(fullAddress, 'single_full')}
                    style={{
                      padding: '4px 10px',
                      background: copiedKey === 'single_full' ? '#10b981' : '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    {copiedKey === 'single_full' ? '已复制' : '一键复制'}
                  </button>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', background: 'rgba(255,255,255,0.06)', padding: '10px', borderRadius: '6px', wordBreak: 'break-all' }}>
                  {fullAddress}
                </div>
                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'none' }}
                  >
                    在 Google Maps 中验证真实位置 ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 免税州与现成离岸地址库选项卡 */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {READY_MADE_ADDRESSES.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--dumi-default-color-bg, #ffffff)',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, marginBottom: '10px' }}>
                  {item.tag}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '10px', borderRadius: '6px', lineHeight: '1.6' }}>
                  <div><strong>Address:</strong> {item.line1} {item.line2}</div>
                  <div><strong>City / State:</strong> {item.city}, {item.state}</div>
                  <div><strong>ZIP Code:</strong> {item.zip}</div>
                  <div><strong>Phone:</strong> {item.phone}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setLine1(item.line1);
                  setLine2(item.line2);
                  setCity(item.city);
                  setState(item.state);
                  setPostcode(item.zip);
                  setCountry(item.country);
                  setCountryCode(item.countryCode);
                  setTab('convert');
                }}
                style={{
                  marginTop: '12px',
                  padding: '8px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#1e293b',
                }}
              >
                📥 载入并填入此模版
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressValidatorTool;
