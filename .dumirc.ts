import { defineConfig } from 'dumi';

export default defineConfig({
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
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000',
      async: true,
      crossorigin: 'anonymous',
    },
  ],
});
