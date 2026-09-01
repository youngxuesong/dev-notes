<div align="center">

# 🌐 DevNotes — 个人技术与出海资产手记

**一个全栈开发者的 AI 实战、系统架构与跨境金融手记。**

[English](./README.md) | [简体中文](./README.zh-CN.md)

[![Built with dumi](https://img.shields.io/badge/Built%20with-dumi%202-blue.svg)](https://d.umijs.org)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black.svg?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 📖 概览

**DevNotes** 是一个基于 **dumi 2 + React + TypeScript** 构建的高性能、轻量级中英文双语个人静态知识库。专为开发者、独立创作者和全球数字游民打造，专注于经过生产系统与真金白银验证的实战工程经验。

### 🌟 核心板块

1. **🤖 AI 实验室 (`/ai`)**：Coding Agent 实战（Claude Code / Cursor / Pi）、提示词工程与 Prompt Caching 深度降本技巧。
2. **🛠️ 系统工程 (`/engineering`)**：高可用 API 网关设计、多账号智能故障转移（Failover）路由与 Caddy / Docker 生产运维实践。
3. **💳 跨境金融 (`/finance`)**：亲历海外银行开户（汇丰、中银香港、ZA Bank、澳门蚂蚁银行）、多币种资金调度与全球美股投资。
4. **👨‍💻 关于我与作品集 (`/about`)**：个人简介、开源作品集与国际法务合规声明（隐私政策 Privacy Policy、服务条款）。

---

## 🚀 快速上手

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 启动本地开发服务器（支持热更新）
pnpm dev

# 3. 生产环境静态打包（输出至 dist/ 目录）
pnpm build

# 4. 本地预览构建产物
pnpm preview
```

---

## 🌐 部署上线

### 推荐：部署至 Vercel
仓库已预设 `vercel.json` 路由规则。只需在 [Vercel](https://vercel.com) 导入 `dev-notes` 仓库并点击 **Deploy** 即可秒级上线。

### 部署至海外自建服务器（Caddy / Nginx）
将生成的 `dist/` 静态目录直接托管在 Caddy 下：

```caddy
notes.yourdomain.com {
    root * /opt/dev-notes/dist
    file_server
    try_files {path} /index.html
    encode gzip zstd
}
```

---

## 💰 Google AdSense 与合规配置

- 在 `public/ads.txt` 中填入你的真实 Google Publisher ID。
- 在 `.dumirc.ts` 与 `src/components/GoogleAd.tsx` 中将客户端 ID 替换为你的真实 ID。
- 合规政策页面已内置于 `/about/privacy`。

---

## 📄 开源协议

MIT © [youngxuesong](https://github.com/youngxuesong)
