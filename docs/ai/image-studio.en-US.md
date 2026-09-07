---
title: AI Image Studio (Online DALL-E 3 & Flux Workspace)
order: 10
---

# 🎨 AI Image Studio (BYOK Web Workspace)

:::info Overview
**AI Image Studio** is a lightweight, zero-backend image generation workspace designed for developers and creators under the **BYOK (Bring Your Own Key)** model. Generate high-resolution visuals via DALL-E 3, Flux, or any OpenAI-compatible image endpoint right from your browser.

- **Client-Side Only**: Your API key and base URL are kept strictly inside your browser's LocalStorage.
- **Multiple Aspect Ratios**: Instant presets for 1:1 (Avatar/Square), 16:9 (Desktop/Banner), and 9:16 (Mobile/Social Stories).
- **Fast & Direct**: Zero intermediary servers; requests are sent directly from your browser to your API gateway.
:::

<ImageStudioTool />

---

## 📌 Prompt Engineering Formula for Generative AI

To achieve production-grade commercial aesthetics, follow this structural formula:

> **📐 Recommended Formula**:  
> **Subject** + **Material & Texture** + **Environment / Background** + **Lighting** + **Art Style / Resolution**

### Visual Style Cheatsheet

| Category | Best For | Suggested Keywords |
| :--- | :--- | :--- |
| **Commercial Still Life** | E-commerce, Packaging, Hero Banners | `minimalist product photography, studio soft lighting, luxury glass texture, clean negative space, 8k resolution` |
| **Cyberpunk Sci-Fi** | Concept Art, Wallpapers, Tech Graphics | `cyberpunk futuristic city, neon lights reflections, wet asphalt, cinematic lighting, atmospheric fog, intricate details` |
| **Japanese Anime Style** | Editorial illustrations, Avatars | `Makoto Shinkai style, summer cumulus clouds, golden hour sunset, anime aesthetic, vibrant warm colors, nostalgic mood` |
| **3D Clay & Isometric** | App Icons, Toys, IP Characters | `3D claymation style, cute character, pastel colors, soft ambient occlusion, isometric view, trending on ArtStation` |

---

## 💡 Frequently Asked Questions

### 1. Does this tool support custom endpoints?
Yes! You can point the Base URL to any OpenAI-compatible gateway (e.g. Sub2API, Cloudflare AI Gateway, or official OpenAI `https://api.openai.com`).

### 2. What is the "Revised Prompt"?
For models like DALL-E 3, the upstream LLM automatically expands user prompts into rich visual descriptors before synthesis. The revised prompt is displayed below the canvas for inspection and learning.

### 3. Is my API Key secure?
Yes. The tool runs completely inside your browser client without any backend collection or proxying.
