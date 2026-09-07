import React, { useState, useEffect } from 'react';

interface Preset {
  label: string;
  desc: string;
  prompt: string;
}

const PRESETS: Preset[] = [
  {
    label: '商业静物摄影',
    desc: '极简产品大片',
    prompt:
      'Premium commercial product photography, a minimalist luxury perfume bottle on a smooth light stone surface, glass and matte metal textures, soft directional studio lighting, clean negative space, 8k resolution, ultra-detailed.',
  },
  {
    label: '赛博朋克概念',
    desc: '未来都市雨夜',
    prompt:
      'Futuristic cyberpunk city street at rainy night, glowing neon signs reflections on wet asphalt, flying vehicles, atmospheric haze, cinematic lighting, photorealistic, intricate architectural details.',
  },
  {
    label: '新海诚日漫风',
    desc: '唯美天空光影',
    prompt:
      'Makoto Shinkai anime style illustration, magnificent summer cumulus clouds, radiant golden hour lighting, a train passing by railway crossing, vibrant colors, emotional and nostalgic atmosphere.',
  },
  {
    label: '3D 粘土萌物',
    desc: 'C4D/Blender 可爱风格',
    prompt:
      'Cute 3D claymation astronaut exploring a colorful candy planet, soft clay texture, warm ambient occlusion lighting, isometric view, playful pastel colors, charming details, trending on ArtStation.',
  },
];

interface AspectOption {
  label: string;
  ratio: string;
  size: string;
  desc: string;
}

const ASPECT_OPTIONS: AspectOption[] = [
  { label: '1:1 方形', ratio: '1:1', size: '1024x1024', desc: '社交头像 / Instagram' },
  { label: '16:9 横屏', ratio: '16:9', size: '1792x1024', desc: '电脑壁纸 / 文章配图' },
  { label: '9:16 竖屏', ratio: '9:16', size: '1024x1792', desc: '手机壁纸 / 小红书 / 故事' },
];

export const ImageStudioTool: React.FC = () => {
  // 控制参数
  const [prompt, setPrompt] = useState<string>(PRESETS[0].prompt);
  const [selectedSize, setSelectedSize] = useState<string>('1024x1024');
  const [model, setModel] = useState<string>('dall-e-3');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [baseUrl, setBaseUrl] = useState<string>('https://vibecoding.kuyiduo.hidns.vip');
  const [apiKey, setApiKey] = useState<string>('');
  const [rememberKey, setRememberKey] = useState<boolean>(true);
  const [showKey, setShowKey] = useState<boolean>(false);

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

  // 保存或清除本地记忆
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

  // 触发生成
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg('请输入画面描述 (Prompt)');
      return;
    }
    if (!apiKey.trim()) {
      setErrorMsg('请在左下方 Connection 处填入你的 API Key');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    // 标准化 endpoint 地址
    let cleanBase = baseUrl.trim().replace(/\/+$/, '');
    // 兼容用户填写了完整 /v1 或者裸域名
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

        // 加入历史记录
        setHistory((prev) => [
          {
            url: imgUrl,
            prompt: prompt.trim(),
            size: selectedSize,
            time: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 9), // 最多保留 10 张
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
      {/* 顶部声明 / 模式说明 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'linear-gradient(135deg, #1e1e24 0%, #2a2a38 100%)',
          color: '#fff',
          borderRadius: '12px 12px 0 0',
          fontSize: '13px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🎨</span>
          <span style={{ fontWeight: 600, letterSpacing: '0.5px' }}>AI Image Studio (BYOK 极速生图工作台)</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              background: '#10b981',
              color: '#fff',
              borderRadius: '4px',
              fontWeight: 500,
            }}
          >
            浏览器直连 · 0 数据留存
          </span>
        </div>
        <span style={{ color: '#9ca3af', fontSize: '12px' }}>
          支持 DALL-E 3 / Flux / Midjourney 兼容网关
        </span>
      </div>

      {/* 主体工作台：左侧控制，右侧画布 */}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 1. Prompt 区 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                💡 画面描述 (Prompt)
              </label>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>英文出图更精准</span>
            </div>
            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="用中英文细致描述你心中的构图、光影、主体和风格..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                lineHeight: '1.5',
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            {/* 灵感预设按钮 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p.prompt)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#4b5563',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.borderColor = '#3b82f6')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.borderColor = '#e5e7eb')}
                  title={p.desc}
                >
                  ✨ {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 画幅比例规格 */}
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
                      border: active ? '2px solid #3b82f6' : '1px solid #d1d5db',
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

          {/* 3. 模型与画质选择 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                🤖 模型 (Model)
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="dall-e-3"
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                }}
              />
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
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '12px',
                  background: '#fff',
                  boxSizing: 'border-box',
                }}
              >
                <option value="standard">Standard (标准)</option>
                <option value="hd">HD (超高清细节)</option>
              </select>
            </div>
          </div>

          {/* 4. Connection 凭证配置 */}
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
              <span style={{ fontSize: '11px', color: '#10b981' }}>仅存本地 LocalStorage</span>
            </div>

            {/* Base URL */}
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

            {/* API Key */}
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
              记住此设备配置 (无需每次重新输入)
            </label>
          </div>

          {/* 生成按钮 */}
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
                正在精细绘制中 (约10-25秒)...
              </>
            ) : (
              <>
                <span>🚀</span> 立即生成画作
              </>
            )}
          </button>

          {/* 错误提示 */}
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
                <div style={{ fontSize: '36px', marginBottom: '14px', animation: 'bounce 1s infinite' }}>🎨</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>AI 神经渲染引擎正在构建光影...</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>
                  调用原生超高清文生图模型，请稍候
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

                {/* 优化后的提示词说明 */}
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
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>🔍 DALL-E 3 自动语义增强提示词 (Revised Prompt)</span>
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
                <div style={{ fontSize: '12px', marginTop: '4px' }}>在左侧填写提示词与 API Key，点击“立即生成”即可实时出图</div>
              </div>
            )}
          </div>

          {/* 历史记录微型画廊 */}
          {history.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>
                🕒 本次绘画历史 (点击切换大图)
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
