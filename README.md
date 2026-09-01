<div align="center">

# 🌐 DevNotes

**A Pragmatic Full-Stack Engineer's Digital Garden on AI Agents, System Architecture & Cross-Border Finance.**

[English](./README.md) | [简体中文](./README.zh-CN.md)

[![Built with dumi](https://img.shields.io/badge/Built%20with-dumi%202-blue.svg)](https://d.umijs.org)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black.svg?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 📖 Overview

**DevNotes** is a fast, lightweight, and bilingual static knowledge base built with **dumi 2 + React + TypeScript**. Designed for developers, indie hackers, and global tech nomads, it focuses on real-world engineering experiences validated by production systems and capital routing.

### 🌟 Core Sections

1. **🤖 AI Lab (`/ai`)**: Real-world practices with autonomous coding agents (Claude Code, Cursor, Pi), prompt engineering, and Prompt Caching cost optimization.
2. **🛠️ System Engineering (`/engineering`)**: Resilient API gateway design, intelligent multi-account failover routing, and production DevOps with Caddy & Docker.
3. **💳 Cross-Border Finance (`/finance`)**: First-hand offshore banking walkthroughs (HSBC, BOCHK, ZA Bank, Ant Bank Macau), multi-currency routing, and global investing.
4. **👨‍💻 About & Showcase (`/about`)**: Author profile, open-source projects, and international legal compliance (Privacy Policy, Terms of Service).

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Start local development server with hot reload
pnpm dev

# 3. Build for production (outputs to dist/)
pnpm build

# 4. Preview production build locally
pnpm preview
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)
This repository includes a pre-configured `vercel.json`. Simply import your repository into [Vercel](https://vercel.com) and click **Deploy**.

### Deploy to Overseas Server (Caddy / Nginx)
Serve the generated `dist/` folder directly via Caddy:

```caddy
notes.yourdomain.com {
    root * /opt/dev-notes/dist
    file_server
    try_files {path} /index.html
    encode gzip zstd
}
```

---

## 💰 Google AdSense & Compliance

- Update your publisher ID in `public/ads.txt`.
- Configure your client ID in `.dumirc.ts` and `src/components/GoogleAd.tsx`.
- Legal and Privacy Policy pages are built-in under `/about/privacy`.

---

## 📄 License

MIT © [youngxuesong](https://github.com/youngxuesong)
