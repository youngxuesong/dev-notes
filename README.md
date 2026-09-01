# DevNotes — 个人技术与出海资产手记

基于 **dumi 2 + React** 构建的高性能个人技术与跨境金融双语静态知识库。

## 🌟 核心板块

1. **🤖 AI & Agent (`/ai`)**：Coding Agent 实战（Claude Code / Cursor / Pi）与 Prompt Caching 优化技巧。
2. **🛠️ 架构与系统工程 (`/engineering`)**：高可用网关设计、Failover 容灾路由、Caddy / Docker 部署实践。
3. **💳 跨境金融与出海 (`/finance`)**：海外银行（OCBC、Wise）、独立开发者资金流转与美股指数投资。
4. **⚡ 踩坑备忘录 TIL (`/til`)**：高频 Bug 速查、API 429 优雅重试、数据库性能优化备忘。
5. **🚀 作品集 (`/projects`)**：个人开源与代表性项目展示。
6. **👨‍💻 关于我与合规 (`/about`)**：关于作者背景、联系方式及 AdSense 必备的隐私政策（Privacy Policy）。

---

## 🚀 本地开发与构建

```bash
# 1. 安装依赖
pnpm install

# 2. 本地开发调试
pnpm dev

# 3. 生产环境静态打包（生成 dist/ 目录）
pnpm build

# 4. 本地预览构建产物
pnpm preview
```

---

## 🌐 部署上线指南（海外服务器 + Caddy）

将打包生成的 `dist/` 目录上传到海外服务器，在 Caddy 配置中添加以下反代规则即可：

```caddy
notes.yourdomain.com {
    root * /opt/dev-notes/dist
    file_server
    try_files {path} /index.html
    encode gzip zstd
}
```

---

## 💰 Google AdSense 配置提示

1. 在 `public/ads.txt` 中填入你的真实 Google Publisher ID。
2. 在 `.dumirc.ts` 的 `headScripts` 和 `src/components/GoogleAd.tsx` 中将 `ca-pub-0000000000000000` 替换为你的真实客户端 ID。
