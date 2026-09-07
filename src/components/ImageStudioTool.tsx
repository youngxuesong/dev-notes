import React, { useState, useEffect } from 'react';

export interface PresetCategory {
  category: string;
  icon: string;
  items: Array<{
    label: string;
    badge: string;
    desc: string;
    prompt: string;
    defaultRatio?: string;
  }>;
}

// 从 awesome-gpt-image-2 提炼并深度工程化改良的高质量提示词库
export const CURATED_PRESETS: PresetCategory[] = [
  {
    category: '科技与产品可视化',
    icon: '⚡',
    items: [
      {
        label: '高科技硬件立体爆炸图 (Exploded View)',
        badge: '工业设计',
        desc: '精密机械零件层级拆解与科技质感',
        defaultRatio: '16:9',
        prompt:
          'High-tech exploded view product diagram poster of an ultra-sleek futuristic VR headset. Vertically stacked floating component layers: transparent curved visor, micro-OLED optical lenses, intricate motherboard circuit chip with glowing cyan traces, compact cooling fan, lithium battery module, ergonomic cushioned strap. Clean studio lighting, soft purple and deep blue ambient gradient background, technical annotation lines, 8k resolution, cinematic industrial 3D render.',
      },
      {
        label: '极简奢华商业静物摄影',
        badge: '电商大片',
        desc: '自然漫射光与高端材质质感',
        defaultRatio: '1:1',
        prompt:
          'Premium commercial product photography, an elegant minimalist matte black smart device on a textured light limestone surface, brushed titanium and frosted glass accents, soft directional natural morning window light, subtle soft shadow casting, clean negative space, depth of field, Hasselblad medium format camera look, ultra-sharp detail.',
      },
    ],
  },
  {
    category: '角色与社交头像 (Avatar)',
    icon: '👤',
    items: [
      {
        label: '日系夏日海滨落日写真',
        badge: '真实质感',
        desc: '黄金时刻水花飞溅与胶片光影',
        defaultRatio: '9:16',
        prompt:
          'A photorealistic vertical beach portrait of an attractive young East Asian woman smiling warmly at the camera at golden hour sunset, wet shoulder-length dark hair clinging naturally to face. Reaching one hand playfully toward the lens throwing sparkling sea water, freezing droplets in mid-air with high-speed shutter. Warm cinematic backlighting, natural radiant skin texture, shimmering ocean bokeh, 35mm lifestyle photography aesthetic.',
      },
      {
        label: '3D 软胶盲盒潮流玩具手办',
        badge: 'Q版潮玩',
        desc: 'C4D/Popmart 风格光泽质感',
        defaultRatio: '1:1',
        prompt:
          'Cute 3D stylized designer toy avatar of an anime chibi girl, smooth glossy plastic and soft vinyl texture, rounded forms, cute dark bob hair with round glasses. Wearing an oversized pastel hoodie and chunky sneakers. Standing on a pastel pedestal against a soft neutral studio background, gentle overhead softbox lighting, ambient occlusion, Pop Mart collectible aesthetic, Octane 3D render.',
      },
      {
        label: '赛博机能风高反光墨镜肖像',
        badge: '时尚大片',
        desc: '黑白高对比度极简奢华感',
        defaultRatio: '1:1',
        prompt:
          'Ultra-realistic high-fashion editorial close-up portrait with a minimalist luxury aesthetic, captured entirely in dramatic black and white monochrome tones. Subject wearing futuristic mirrored wraparound shield sunglasses with polished chrome metallic frames. Crisp specular highlights on skin and sunglasses lenses reflecting soft studio lightboxes, deep blacks, subtle 35mm film grain, confident jawline, sharp cinematic focus.',
      },
    ],
  },
  {
    category: '插画与概念艺术',
    icon: '🎨',
    items: [
      {
        label: '新海诚唯美日漫光影',
        badge: '情绪插画',
        desc: '夏日积雨云与金黄黄昏逆光',
        defaultRatio: '16:9',
        prompt:
          'Makoto Shinkai anime aesthetic landscape illustration. Majestic towering summer cumulonimbus thunderhead clouds glowing under radiant golden hour sunset. A train passing through a countryside railway crossing with green fields and distant ocean view. Luminous lens flares, vibrant saturated colors, nostalgic and poetic atmosphere, ultra-fine anime background art.',
      },
      {
        label: '复古手绘羊皮纸美食探店地图',
        badge: '信息图表',
        desc: '水彩墨线手绘风格文旅地图',
        defaultRatio: '16:9',
        prompt:
          'Illustrated tourist food map infographic on textured vintage beige parchment paper. Hand-drawn watercolor and black ink sketch style. Charming miniature illustrations of landmarks (traditional pavilion, modern skyscraper) and local food delicacies (spicy hotpot, dumplings, tea bowl) connected by soft watercolor roads and rivers. Cute cartoon mascot in corner, warm friendly hand-lettered aesthetic, intricate details.',
      },
      {
        label: '未来赛博朋克雨夜都市',
        badge: '科幻场景',
        desc: '霓虹倒影与深邃纵深感',
        defaultRatio: '16:9',
        prompt:
          'Futuristic cyberpunk metropolis at pouring rain night, towering skyscrapers with giant holographic anime advertisements, flying hovercars navigating between sky bridges, neon light reflections on wet asphalt streets. Atmospheric dense steam, volumetric lighting, high contrast cinematic color grading, hyper-detailed photorealistic concept art.',
      },
    ],
  },
];

interface AspectOption {
  label: string;
  ratio: string;
  size: string;
  desc: string;
}

const ASPECT_OPTIONS: AspectOption[] = [
  { label: '1:1 方形', ratio: '1:1', size: '1024x1024', desc: '社交头像 / 潮玩' },
  { label: '16:9 横屏', ratio: '16:9', size: '1792x1024', desc: '桌面壁纸 / 科技大片' },
  { label: '9:16 竖屏', ratio: '9:16', size: '1024x1792', desc: '手机壁纸 / 真实人像' },
];

export interface ModelOption {
  id: string;
  name: string;
  desc: string;
  recommended?: boolean;
}

// 线上生产网关当前已实际支持的生图模型列表
export const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'gpt-image-2', name: 'GPT Image 2 (最新推荐)', desc: '次世代高精度文本排版与光影一致性', recommended: true },
  { id: 'gpt-image-1.5', name: 'GPT Image 1.5', desc: '高速高质感平衡生图模型' },
  { id: 'gpt-image-1', name: 'GPT Image 1 (标准版)', desc: '基础稳定多模态图像生成' },
  { id: 'dall-e-3', name: 'DALL-E 3 (OpenAI 兼容)', desc: '经典强语义理解与自动提示词增强' },
];

export const ImageStudioTool: React.FC = () => {
  // 控制参数
  const [prompt, setPrompt] = useState<string>(CURATED_PRESETS[0].items[0].prompt);
  const [selectedSize, setSelectedSize] = useState<string>('1792x1024');
  const [model, setModel] = useState<string>(AVAILABLE_MODELS[0].id);
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [baseUrl, setBaseUrl] = useState<string>('https://vibecoding.kuyiduo.hidns.vip');
  const [apiKey, setApiKey] = useState<string>('');
  const [rememberKey, setRememberKey] = useState<boolean>(true);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<number>(0);

  // 运行状态
  const [loading, setLoading] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentRevisedPrompt, setCurrentRevisedPrompt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ url: string; prompt: string; size: string; time: string }>>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // 初始化读取本地缓存的 Key 和 BaseUrl
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('devnotes_ai_key');
      const savedUrl = localStorage.getItem('devnotes_ai_base_url');
      if (savedKey) setApiKey(savedKey);
      if (savedUrl) setBaseUrl(savedUrl);
    } catch (e) {
      console.warn('LocalStorage access blocked:', e);
    }
  }, []);

  const handleKeyChange = (val: string) => {
    setApiKey(val);
    if (rememberKey) {
      try {
        localStorage.setItem('devnotes_ai_key', val);
      } catch (e) {}
    }
  };

  const handleBaseUrlChange = (val: string) => {
    setBaseUrl(val);
    if (rememberKey) {
      try {
        localStorage.setItem('devnotes_ai_base_url', val);
      } catch (e) {}
    }
  };

  const handleRememberToggle = (checked: boolean) => {
    setRememberKey(checked);
    try {
      if (checked) {
        localStorage.setItem('devnotes_ai_key', apiKey);
        localStorage.setItem('devnotes_ai_base_url', baseUrl);
      } else {
        localStorage.removeItem('devnotes_ai_key');
        localStorage.removeItem('devnotes_ai_base_url');
      }
    } catch (e) {}
  };

  // 选择预设时，自动联动最佳画幅比例
  const applyPreset = (item: { prompt: string; defaultRatio?: string }) => {
    setPrompt(item.prompt);
    if (item.defaultRatio === '1:1') setSelectedSize('1024x1024');
    else if (item.defaultRatio === '16:9') setSelectedSize('1792x1024');
    else if (item.defaultRatio === '9:16') setSelectedSize('1024x1792');
  };

  // 触发生成
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg('请输入画面描述 (Prompt)');
      return;
    }
    if (!apiKey.trim()) {
      setErrorMsg('请在下方 Connection 区域填入你的 API Key');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    let cleanBase = baseUrl.trim().replace(/\/+$/, '');
    let endpoint = cleanBase.endsWith('/v1')
      ? `${cleanBase}/images/generations`
      : `${cleanBase}/v1/images/generations`;

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: model.trim() || 'dall-e-3',
          prompt: prompt.trim(),
          size: selectedSize,
          quality: quality,
          n: 1,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        const errDetail = data?.error?.message || data?.message || JSON.stringify(data);
        throw new Error(errDetail || `HTTP ${resp.status}`);
      }

      if (data?.data && data.data.length > 0) {
        const item = data.data[0];
        const imgUrl = item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null);

        if (!imgUrl) {
          throw new Error('上游接口未返回有效图片数据');
        }

        setCurrentImage(imgUrl);
        setCurrentRevisedPrompt(item.revised_prompt || null);

        setHistory((prev) => [
          {
            url: imgUrl,
            prompt: prompt.trim(),
            size: selectedSize,
            time: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 9),
        ]);
      } else {
        throw new Error('未获取到生成的图片');
      }
    } catch (err: any) {
      console.error('Image Generation Error:', err);
      setErrorMsg(err.message || '生成失败，请检查网络连接或 API Key 配额');
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ margin: '24px 0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* 顶部标题条 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
          color: '#fff',
          borderRadius: '12px 12px 0 0',
          fontSize: '13px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🎨</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.4px' }}>
              AI Image Studio (精选灵感工作台)
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
              集成 Awesome-GPT-Image-2 精品调参公式 · BYOK 模式
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              background: '#059669',
              color: '#fff',
              borderRadius: '4px',
              fontWeight: 500,
            }}
          >
            浏览器直连
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              background: '#374151',
              color: '#d1d5db',
              borderRadius: '4px',
            }}
          >
            DALL-E 3 / Flux
          </span>
        </div>
      </div>

      {/* 精选分类预设选择区 */}
      <div
        style={{
          background: '#f3f4f6',
          borderLeft: '1px solid #e5e7eb',
          borderRight: '1px solid #e5e7eb',
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>🎯 灵感预设：</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {CURATED_PRESETS.map((cat, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveCategory(idx)}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: activeCategory === idx ? 600 : 500,
                  borderRadius: '6px',
                  border: activeCategory === idx ? '1px solid #2563eb' : '1px solid #d1d5db',
                  background: activeCategory === idx ? '#eff6ff' : '#fff',
                  color: activeCategory === idx ? '#1d4ed8' : '#4b5563',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {cat.icon} {cat.category}
              </button>
            ))}
          </div>
        </div>

        {/* 当前分类下的精选 Prompt 卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
          {CURATED_PRESETS[activeCategory].items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => applyPreset(item)}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937' }}>{item.label}</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: '#f3f4f6',
                    color: '#6b7280',
                  }}
                >
                  {item.badge}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 主体工作台：左侧参数，右侧画布 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 420px) 1fr',
          gap: '16px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: '20px',
          minHeight: '620px',
        }}
      >
        {/* 左侧控制栏 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Prompt 文本框 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                📝 提示词 (Prompt)
              </label>
              <button
                type="button"
                onClick={() => setPrompt('')}
                style={{ fontSize: '11px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                清空
              </button>
            </div>
            <textarea
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="输入中英文详细描述，包括主体、材质、光影、环境和风格..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '12px',
                lineHeight: '1.5',
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* 画幅比例规格 */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
              📐 画幅比例与尺寸
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {ASPECT_OPTIONS.map((opt) => {
                const active = selectedSize === opt.size;
                return (
                  <button
                    key={opt.size}
                    type="button"
                    onClick={() => setSelectedSize(opt.size)}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '8px',
                      border: active ? '2px solid #2563eb' : '1px solid #d1d5db',
                      background: active ? '#eff6ff' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: active ? 600 : 500, color: active ? '#1d4ed8' : '#374151' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{opt.size}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 模型与画质 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                  🤖 生图模型 (Model)
                </label>
                <span style={{ fontSize: '10px', color: '#059669', background: '#ecfdf5', padding: '1px 4px', borderRadius: '3px' }}>
                  已实装
                </span>
              </div>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '12px',
                  background: '#fff',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontWeight: 500,
                  color: '#1f2937',
                }}
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                🌟 画质 (Quality)
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '12px',
                  background: '#fff',
                  boxSizing: 'border-box',
                  outline: 'none',
                  color: '#1f2937',
                }}
              >
                <option value="standard">Standard (标准)</option>
                <option value="hd">HD (超清精细)</option>
              </select>
            </div>
          </div>

          {/* Connection 凭证设置 */}
          <div
            style={{
              padding: '12px',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>🔐 API 接入凭据 (Connection)</span>
              <span style={{ fontSize: '11px', color: '#10b981' }}>浏览器本地安全存储</span>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '3px' }}>Base URL (网关地址)</div>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => handleBaseUrlChange(e.target.value)}
                placeholder="https://vibecoding.kuyiduo.hidns.vip"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '3px' }}>API Key (令牌)</div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder="sk-..."
                  style={{
                    width: '100%',
                    padding: '6px 30px 6px 8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#9ca3af',
                  }}
                >
                  {showKey ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b7280', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberKey}
                onChange={(e) => handleRememberToggle(e.target.checked)}
              />
              记住此设备配置 (保存在本地 LocalStorage)
            </label>
          </div>

          {/* 生成主按钮 */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            style={{
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              color: '#fff',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                正在精细生成中 (约15-25秒)...
              </>
            ) : (
              <>
                <span>🚀</span> 立即生成画作
              </>
            )}
          </button>

          {/* 错误警告 */}
          {errorMsg && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '12px',
                lineHeight: '1.4',
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* 右侧展示画布 (Canvas) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            padding: '18px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #f3f4f6',
              paddingBottom: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>🖼️ 创意画布 (Canvas)</span>
              {currentImage && (
                <span style={{ fontSize: '11px', padding: '2px 6px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px' }}>
                  {selectedSize} · {quality.toUpperCase()}
                </span>
              )}
            </div>

            {currentImage && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={currentImage}
                  target="_blank"
                  rel="noreferrer"
                  download="ai-generated.png"
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: '#10b981',
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  ⬇️ 下载高清原图
                </a>
              </div>
            )}
          </div>

          {/* 画布中央区域 */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fafafa',
              borderRadius: '8px',
              border: '1px dashed #e5e7eb',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '380px',
            }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <div style={{ fontSize: '38px', marginBottom: '14px', animation: 'pulse 1.5s infinite' }}>🎨</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>AI 渲染引擎正在实时合成画面...</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>
                  解析高密度光影细节与几何结构，请稍候
                </div>
              </div>
            ) : currentImage ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px' }}>
                <img
                  src={currentImage}
                  alt="AI Generated"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '460px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />

                {currentRevisedPrompt && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                        🔍 模型自动扩展提示词 (Revised Prompt)
                      </span>
                      <button
                        type="button"
                        onClick={() => copyPrompt(currentRevisedPrompt)}
                        style={{
                          fontSize: '11px',
                          color: '#2563eb',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {copied ? '已复制 ✔' : '复制'}
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                      {currentRevisedPrompt}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                <div style={{ fontSize: '42px', marginBottom: '10px' }}>🖼️</div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#4b5563' }}>画板已就绪，静候你的创意</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  从上方点击热门预设，或在左侧输入专属 Prompt，点击“立即生成”
                </div>
              </div>
            )}
          </div>

          {/* 历史记录微型画廊 */}
          {history.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>
                🕒 本次绘画画廊 (点击切换大图)
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {history.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setCurrentImage(h.url);
                      setPrompt(h.prompt);
                    }}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: currentImage === h.url ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      flexShrink: 0,
                    }}
                  >
                    <img src={h.url} alt="history" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudioTool;
