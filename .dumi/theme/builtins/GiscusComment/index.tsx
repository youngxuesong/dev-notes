import React, { useEffect, useRef } from 'react';
import { useLocation, usePrefersColor } from 'dumi';

interface GiscusCommentProps {
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
}

export const GiscusComment: React.FC<GiscusCommentProps> = ({
  repo = 'youngxuesong/dev-notes',
  repoId = 'R_kgDON7xxxx', // 待替换为你的真实 repoId
  category = 'Announcements',
  categoryId = 'DIC_kwDON7xxxx', // 待替换为你的真实 categoryId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [color] = usePrefersColor();

  useEffect(() => {
    if (!containerRef.current) return;

    // 清理旧的评论 iframe
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', color === 'dark' ? 'dark_dimmed' : 'light');
    script.setAttribute('data-lang', location.pathname.startsWith('/en-US') ? 'en' : 'zh-CN');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    containerRef.current.appendChild(script);
  }, [location.pathname, color, repo, repoId, category, categoryId]);

  return (
    <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 {location.pathname.startsWith('/en-US') ? 'Comments & Discussion' : '读者讨论与留言'}
      </div>
      <div ref={containerRef} />
    </div>
  );
};

export default GiscusComment;
