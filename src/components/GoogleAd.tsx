import React, { useEffect } from 'react';

interface GoogleAdProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  style?: React.CSSProperties;
}

/**
 * Google AdSense 响应式广告组件
 */
export const GoogleAd: React.FC<GoogleAdProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  style = {},
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn('Google Adsense Error:', err);
    }
  }, []);

  return (
    <div
      style={{
        margin: '24px 0',
        padding: '12px',
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.02)',
        borderRadius: '8px',
        border: '1px dashed rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px' }}>ADVERTISEMENT / 赞助广告</div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-0000000000000000" // 替换为你的真实 ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};
