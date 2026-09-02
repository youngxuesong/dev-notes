import { defineConfig } from 'dumi';

export default defineConfig({
  metas: [
    {
      name: 'keywords',
      content: 'AI Agent, Claude Code, OpenAI Codex, CC Switch, LLM Gateway, 境外银行开户, 香港汇丰, 中银香港, 跨境金融, 全栈开发',
    },
    {
      name: 'description',
      content: 'DevNotes - 全栈开发者的数字花园，专注于 AI Agent 实战架构、Claude Code 与 Codex 工具链接入、高可用系统工程及港澳跨境金融出海指南。',
    },
    { property: 'og:site_name', content: 'DevNotes' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'DevNotes - AI Agent & System Engineering & Cross-Border Finance' },
    {
      property: 'og:description',
      content: '全栈开发者的实战笔记：深入拆解 Claude Code、Agent 架构、LLM 网关与境外金融闭环。',
    },
  ],
  themeConfig: {
    name: 'DevNotes',
    logo: false,
    nav: {
      'zh-CN': [
        { title: '🤖 AI 实验室', link: '/ai' },
        { title: '🛠️ 系统工程', link: '/engineering' },
        { title: '💳 跨境金融', link: '/finance' },
        { title: '👨‍💻 关于我', link: '/about' },
      ],
      'en-US': [
        { title: '🤖 AI Lab', link: '/en-US/ai' },
        { title: '🛠️ Engineering', link: '/en-US/engineering' },
        { title: '💳 Finance', link: '/en-US/finance' },
        { title: '👨‍💻 About', link: '/en-US/about' },
      ],
    },
    footer: 'Copyright © 2026 DevNotes. Built with dumi for global developers.',
    socialLinks: {
      github: 'https://github.com/youngxuesong',
    },
  },
  locales: [
    { id: 'zh-CN', name: '简体中文' },
    { id: 'en-US', name: 'English' },
  ],
  favicons: ['https://gw.alipayobjects.com/zos/bmw-prod/d3e3eb39-1cd7-4aa5-827c-877deced6b7e/lalxt4t3_0.5.png'],
  headScripts: [
    {
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4850459348723767',
      async: true,
      crossorigin: 'anonymous',
    },
    {
      src: 'https://www.googletagmanager.com/gtag/js?id=G-2S3CTJ4QV9',
      async: true,
    },
    `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-2S3CTJ4QV9');
    `,
  ],
});
