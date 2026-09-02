import React from 'react';
import ContentFooter from 'dumi/theme-default/slots/ContentFooter';
import GiscusComment from '../../builtins/GiscusComment';
import { useRouteMeta } from 'dumi';

const CustomContentFooter: React.FC = () => {
  const { frontmatter } = useRouteMeta();
  // 如果 frontmatter 明确声明 comments: false，或者在纯协议页则不展示评论
  const showComments = frontmatter.comments !== false && frontmatter.title;

  return (
    <>
      <ContentFooter />
      {showComments && <GiscusComment />}
    </>
  );
};

export default CustomContentFooter;
