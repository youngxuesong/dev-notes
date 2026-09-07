---
title: AI 生图工坊 (DALL-E 3 & Flux 在线工作台)
order: 10
---

# 🎨 AI Image Studio (自带 Key 极速生图工作台)

:::info 工具说明
这是一个专为创作者与开发者设计的 **轻量级 AI 绘图工作台 (BYOK 模式)**。无需配置复杂的本地环境或下载巨型模型权重，直接通过你的 OpenAI / Sub2API 接口令牌，在浏览器端即可完成 **DALL-E 3 / Flux / 兼容 Midjourney 模型** 的高清图像生成。

- **0 数据留存**：API 令牌与接口地址仅保存在当前浏览器的 LocalStorage，不经过任何第三方服务器中转。
- **多画幅适配**：原生支持 1:1（方形头像）、16:9（宽屏大片/文章配图）、9:16（手机竖屏海报）。
- **极速响应**：浏览器直接向 AI 网关发起生成请求并渲染，支持一键下载超高清原图。
:::

<ImageStudioTool />

---

## 📌 提示词 (Prompt) 黄金公式与高频范例

想要生成商业级质感的大片，结构化的 Prompt 描述至关重要：

> **📐 优质提示词公式**：  
> **主体对象 (Subject)** + **材质细节 (Material/Texture)** + **环境背景 (Environment/Setting)** + **光影风格 (Lighting)** + **画质渲染风格 (Style/Resolution)**

### 常见创意风格参考

| 风格分类 | 适用场景 | 关键 Prompt 词汇建议 |
| :--- | :--- | :--- |
| **商业静物大片** | 电商产品、包装展示、品牌视觉 | `minimalist product photography, studio soft lighting, luxury glass texture, clean negative space, 8k resolution` |
| **科幻未来都市** | 概念设计、壁纸、科技感海报 | `cyberpunk futuristic city, neon lights reflections, wet asphalt, cinematic lighting, atmospheric fog, intricate details` |
| **日系清新动漫** | 故事插画、壁纸、社交媒体封面 | `Makoto Shinkai style, summer cumulus clouds, golden hour sunset, anime aesthetic, vibrant warm colors, nostalgic mood` |
| **3D 粘土与盲盒** | IP 设计、App 图标、潮流手办 | `3D claymation style, cute character, pastel colors, soft ambient occlusion, isometric view, trending on ArtStation` |

---

## 💡 常见问题 (FAQ)

### 1. 为什么生成的图片长宽比有时会有微调？
DALL-E 3 等模型标准分辨率包括：
- **1:1**：`1024x1024`（通用方形）
- **16:9**：`1792x1024`（横向宽屏）
- **9:16**：`1024x1792`（垂直构图）  
工作台会自动将你选择的比例匹配为底层支持的最佳分辨率参数。

### 2. 什么是“Revised Prompt (语义增强提示词)”？
OpenAI 的 DALL-E 3 模型在收到简短提示词时，其内置的语言模型（GPT-4 视觉层）会自动帮你扩展细节以获得更高的图像质量。生成的图片下方展示的即为模型最终绘制时使用的完整提示词，非常适合用来反推和学习提示词技巧。

### 3. API Key 会泄露吗？
本页面为纯静态 React 应用，所有 API 请求均直接由你的浏览器端向你指定的 Base URL 发起，代码开源透明，**绝对不会上传或存储你的任何密钥数据**。
