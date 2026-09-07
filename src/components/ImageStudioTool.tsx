import React, { useState, useEffect } from 'react';

export interface PresetItem {
  label: string;
  badge: string;
  desc: string;
  ratio: string;
  prompt: string;
}

export const INSPIRATION_PRESETS: PresetItem[] = [
  {
    label: '⚡ 硬件立体爆炸图',
    badge: '工业设计',
    desc: 'VR眼镜精密机械零件与光学透镜层级拆解',
    ratio: '16:9',
    prompt:
      'High-tech exploded view product diagram poster of an ultra-sleek futuristic VR headset. Vertically stacked floating component layers: transparent curved visor, micro-OLED optical lenses, intricate motherboard circuit chip with glowing cyan traces, compact cooling fan, lithium battery module, ergonomic cushioned strap. Clean studio lighting, soft purple and deep blue ambient gradient background, technical annotation lines, 8k resolution, cinematic industrial 3D render.',
  },
  {
    label: '🌅 海滩落日写真',
    badge: '真实质感',
    desc: '黄金时刻水花飞溅抓拍与自然发丝',
    ratio: '9:16',
    prompt:
      'A photorealistic vertical beach portrait of an attractive young East Asian woman smiling warmly at the camera at golden hour sunset, wet shoulder-length dark hair clinging naturally to face. Reaching one hand playfully toward the lens throwing sparkling sea water, freezing droplets in mid-air with high-speed shutter. Warm cinematic backlighting, natural radiant skin texture, shimmering ocean bokeh, 35mm lifestyle photography aesthetic.',
  },
  {
    label: '🧸 3D 软胶潮玩手办',
    badge: 'Q版盲盒',
    desc: 'Pop Mart 风格圆润光泽质感',
    ratio: '1:1',
    prompt:
      'Cute 3D stylized designer toy avatar of an anime chibi girl, smooth glossy plastic and soft vinyl texture, rounded forms, cute dark bob hair with round glasses. Wearing an oversized pastel hoodie and chunky sneakers. Standing on a pastel pedestal against a soft neutral studio background, gentle overhead softbox lighting, ambient occlusion, Pop Mart collectible aesthetic, Octane 3D render.',
  },
  {
    label: '🕶️ 赛博高反光墨镜肖像',
    badge: '时尚大片',
    desc: '黑白高对比度极简奢华感',
    ratio: '1:1',
    prompt:
      'Ultra-realistic high-fashion editorial close-up portrait with a minimalist luxury aesthetic, captured entirely in dramatic black and white monochrome tones. Subject wearing futuristic mirrored wraparound shield sunglasses with polished chrome metallic frames. Crisp specular highlights on skin and sunglasses lenses reflecting soft studio lightboxes, deep blacks, subtle 35mm film grain, confident jawline, sharp cinematic focus.',
  },
  {
    label: '☁️ 新海诚风日漫天空',
    badge: '唯美风景',
    desc: '夏日积雨云与铁道路口逆光',
    ratio: '16:9',
    prompt:
      'Makoto Shinkai anime aesthetic landscape illustration. Majestic towering summer cumulonimbus thunderhead clouds glowing under radiant golden hour sunset. A train passing through a countryside railway crossing with green fields and distant ocean view. Luminous lens flares, vibrant saturated colors, nostalgic and poetic atmosphere, ultra-fine anime background art.',
  },
  {
    label: '🏺 极简奢华商业静物',
    badge: '商业摄影',
    desc: '石质光影与自然微距',
    ratio: '1:1',
    prompt:
      'Premium commercial product photography, an elegant minimalist matte black smart device on a textured light limestone surface, brushed titanium and frosted glass accents, soft directional natural morning window light, subtle soft shadow casting, clean negative space, depth of field, Hasselblad medium format camera look, ultra-sharp detail.',
  },
];

export interface ModelOption {
  id: string;
  name: string;
  tag: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'gpt-image-2', name: 'GPT Image 2', tag: '最新推荐' },
  { id: 'gpt-image-1.5', name: 'GPT Image 1.5', tag: '极速出图' },
  { id: 'gpt-image-1', name: 'GPT Image 1', tag: '标准版' },
  { id: 'dall-e-3', name: 'DALL-E 3', tag: 'OpenAI兼容' },
];

export const ImageStudioTool: React.FC = () => {
  // 核心参数
  const [prompt, setPrompt] = useState<string>(INSPIRATION_PRESETS[0].prompt);
  const [selectedRatio, setSelectedRatio] = useState<string>('16:9');
  const [model, setModel] = useState<string>(AVAILABLE_MODELS[0].id);
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [baseUrl, setBaseUrl] = useState<string>('https://vibecoding.kuyiduo.hidns.vip');
  const [apiKey, setApiKey] = useState<string>('');
  const [rememberKey, setRememberKey] = useState<boolean>(true);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showKey, setShowKey] = useState<boolean>(false);

  // 运行状态
  const [loading, setLoading] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentRevisedPrompt, setCurrentRevisedPrompt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ url: string; prompt: string; ratio: string; time: string }>>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // 初始化本地持久化配置
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('devnotes_ai_key');
      const savedUrl = localStorage.getItem('devnotes_ai_base_url');
      if (savedKey) setApiKey(savedKey);
      if (savedUrl) setBaseUrl(savedUrl);
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }, []);

  // 计时器
  useEffect(() => {
    let timer: any;
    if (loading) {
      setElapsedTime(0);
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const saveSettings = (newKey: string, newUrl: string, remember: boolean) => {
    setApiKey(newKey);
    setBaseUrl(newUrl);
    setRememberKey(remember);
    try {
      if (remember) {
        localStorage.setItem('devnotes_ai_key', newKey);
        localStorage.setItem('devnotes_ai_base_url', newUrl);
      } else {
        localStorage.removeItem('devnotes_ai_key');
        localStorage.removeItem('devnotes_ai_base_url');
      }
    } catch (e) {}
  };

  const getDimensionBySize = (ratio: string): string => {
    if (ratio === '1:1') return '1024x1024';
    if (ratio === '16:9') return '1792x1024';
    if (ratio === '9:16') return '1024x1792';
    return '1024x1024';
  };

  const handleApplyPreset = (item: PresetItem) => {
    setPrompt(item.prompt);
    setSelectedRatio(item.ratio);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg('请在上方输入框描述您想生成的画面内容');
      return;
    }
    if (!apiKey.trim()) {
      setShowConfigModal(true);
      setErrorMsg('请先配置您的 API Key（支持自定义网关）');
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
          model: model.trim() || 'gpt-image-2',
          prompt: prompt.trim(),
          size: getDimensionBySize(selectedRatio),
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
          throw new Error('上游服务未返回有效图像链接');
        }

        setCurrentImage(imgUrl);
        setCurrentRevisedPrompt(item.revised_prompt || null);

        setHistory((prev) => [
          {
            url: imgUrl,
            prompt: prompt.trim(),
            ratio: selectedRatio,
            time: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 7),
        ]);
      } else {
        throw new Error('未获取到图像数据');
      }
    } catch (err: any) {
      console.error('Image Generation Error:', err);
      setErrorMsg(err.message || '生成失败，请检查网关地址、API Key 额度或网络连通性');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-art-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const resp = await fetch(url);
        const blob = await resp.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `ai-art-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const copyPromptText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto 30px auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* 1. 顶部极简沉浸式输入控制台 (Raphael.app 风格主卡片) */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(38, 38, 48, 0.98) 0%, rgba(26, 26, 34, 0.98) 100%)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 18px 12px 18px',
          backdropFilter: 'blur(20px)',
          color: '#fff',
        }}
      >
        {/* 输入框核心区 */}
        <div style={{ position: 'relative' }}>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="描述您想生成的图像（支持中英文，快捷键 ⌘+Enter 或 Ctrl+Enter 快速生成）..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f3f4f6',
              fontSize: '15px',
              lineHeight: '1.6',
              resize: 'none',
              boxSizing: 'border-box',
              paddingRight: '60px',
              fontFamily: 'inherit',
            }}
          />
          {prompt && (
            <button
              type="button"
              onClick={() => setPrompt('')}
              title="清空提示词"
              style={{
                position: 'absolute',
                right: '4px',
                top: '4px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#9ca3af',
                fontSize: '11px',
                padding: '3px 7px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              清空
            </button>
          )}
        </div>

        {/* 底部功能栏 (胶囊工具条：模型 + 比例 + 画质 + 凭据配置 + 生成大按钮) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '12px',
            marginTop: '6px',
          }}
        >
          {/* 左侧控制胶囊组 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            {/* 模型选择下拉 */}
            <div style={{ position: 'relative' }}>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#e5e7eb',
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '6px 24px 6px 10px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id} style={{ background: '#1f2937', color: '#fff' }}>
                    🤖 {m.name} ({m.tag})
                  </option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '10px', color: '#9ca3af' }}>▼</span>
            </div>

            {/* 比例选择切换 */}
            <div
              style={{
                display: 'inline-flex',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '2px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {['1:1', '16:9', '9:16'].map((r) => {
                const active = selectedRatio === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRatio(r)}
                    style={{
                      background: active ? '#2563eb' : 'transparent',
                      color: active ? '#fff' : '#9ca3af',
                      border: 'none',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: active ? 600 : 400,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>

            {/* 画质模式选择 */}
            <div style={{ position: 'relative' }}>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as any)}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#e5e7eb',
                  fontSize: '12px',
                  padding: '6px 22px 6px 10px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="standard" style={{ background: '#1f2937', color: '#fff' }}>🌟 Standard</option>
                <option value="hd" style={{ background: '#1f2937', color: '#fff' }}>✨ HD 超高清</option>
              </select>
              <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '10px', color: '#9ca3af' }}>▼</span>
            </div>

            {/* API Key 接入配置按钮 */}
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: apiKey ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.15)',
                border: apiKey ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.4)',
                color: apiKey ? '#34d399' : '#f87171',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <span>{apiKey ? '🟢 Key 已配置' : '🔴 设置 API Key'}</span>
              <span style={{ fontSize: '9px', opacity: 0.8 }}>⚙️</span>
            </button>
          </div>

          {/* 右侧生成主按钮 (Raphael.app 风格主操作键) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={loading}
              onClick={handleGenerate}
              style={{
                padding: '8px 24px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '22px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading
                  ? '#4b5563'
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#fff',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                  <span>渲染中 ({elapsedTime}s)</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>生成图像</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. 灵感预设药丸标签栏 (一行式横向吸顶排布) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          padding: '12px 4px 6px 4px',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
        }}
      >
        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, flexShrink: 0 }}>
          💡 灵感即刻填入：
        </span>
        {INSPIRATION_PRESETS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleApplyPreset(item)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 11px',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              fontSize: '11px',
              color: '#374151',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.color = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#374151';
            }}
            title={item.desc}
          >
            <span>{item.label}</span>
            <span style={{ fontSize: '9px', color: '#9ca3af', background: '#f3f4f6', padding: '1px 4px', borderRadius: '4px' }}>
              {item.ratio}
            </span>
          </button>
        ))}
      </div>

      {/* 3. 错误提示条 */}
      {errorMsg && (
        <div
          style={{
            margin: '10px 0',
            padding: '10px 14px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '10px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>⚠️ {errorMsg}</span>
          {!apiKey && (
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              style={{ background: '#b91c1c', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
            >
              立即配置 Key
            </button>
          )}
        </div>
      )}

      {/* 4. 创意画布展示区 (Canvas) */}
      <div
        style={{
          marginTop: '12px',
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 20px -4px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          minHeight: '480px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 画布状态标题栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderBottom: '1px solid #f3f4f6',
            background: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>🖼️ 创意画布 (Studio Canvas)</span>
            <span style={{ fontSize: '11px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '12px' }}>
              {model} · {getDimensionBySize(selectedRatio)} · {quality.toUpperCase()}
            </span>
          </div>

          {currentImage && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleDownload(currentImage)}
                style={{
                  fontSize: '12px',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>⬇️ 下载高清原图</span>
              </button>
            </div>
          )}
        </div>

        {/* 画布中央图像呈现 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'radial-gradient(circle at 50% 50%, rgba(243, 244, 246, 0.6) 0%, rgba(255, 255, 255, 1) 100%)',
            position: 'relative',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '46px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>🎨</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                AI 神经渲染引擎正在合成画作... ({elapsedTime}s)
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
                已将光影、材质与结构推导至 {getDimensionBySize(selectedRatio)} 超清画幅，请稍候
              </div>
            </div>
          ) : currentImage ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img
                src={currentImage}
                alt="AI Artwork"
                style={{
                  maxWidth: '100%',
                  maxHeight: '600px',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 12px 36px -8px rgba(0, 0, 0, 0.15)',
                }}
              />

              {currentRevisedPrompt && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    width: '100%',
                    maxWidth: '820px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                      🔍 模型优化后的实际生成描述 (Revised Prompt)
                    </span>
                    <button
                      type="button"
                      onClick={() => copyPromptText(currentRevisedPrompt)}
                      style={{ fontSize: '11px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {copied ? '已复制 ✔' : '复制'}
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.5' }}>
                    {currentRevisedPrompt}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '50px', marginBottom: '12px' }}>✨</div>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#4b5563' }}>画板已就绪，立即开启创作</div>
              <div style={{ fontSize: '12px', marginTop: '6px', color: '#9ca3af' }}>
                在顶部输入框描述画面或点击灵感标签，点击右侧「生成图像」按钮
              </div>
            </div>
          )}
        </div>

        {/* 底部历史画廊 (瀑布流卡片缩略图) */}
        {history.length > 0 && (
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px 20px', background: '#fafafa' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '10px' }}>
              🕒 本次创作历史 (点击切换查看)
            </div>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {history.map((h, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setCurrentImage(h.url);
                    setPrompt(h.prompt);
                    setSelectedRatio(h.ratio);
                  }}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: currentImage === h.url ? '2px solid #2563eb' : '1px solid #e5e7eb',
                    flexShrink: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <img src={h.url} alt="history" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. API Key & 网关配置弹窗 (Modal 优雅呼出，不占据页面高度) */}
      {showConfigModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfigModal(false);
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '460px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>⚙️ API 接入与连接设置</div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af' }}
              >
                ✕
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Base URL (API 网关地址)
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://vibecoding.kuyiduo.hidns.vip"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px', display: 'block' }}>
                默认为当前站点的官方高速网关，兼容 OpenAI 标准 API
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>API Key (访问令牌)</label>
                <a
                  href="https://wzyp.cn/shop/ZW3KTBHW"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '11px', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
                >
                  ⚡ 获取生图专属 Key ↗
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  style={{
                    width: '100%',
                    padding: '8px 32px 8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#9ca3af',
                  }}
                >
                  {showKey ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4b5563', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberKey}
                onChange={(e) => setRememberKey(e.target.checked)}
              />
              记住此设备配置 (保存在本地浏览器的 LocalStorage)
            </label>

            <button
              type="button"
              onClick={() => {
                saveSettings(apiKey, baseUrl, rememberKey);
                setShowConfigModal(false);
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              保存并关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageStudioTool;
