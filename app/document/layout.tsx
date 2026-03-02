import React from 'react';

import DocSidebar from './components/DocSidebar';

export default function DocumentLayout({ children }: { children: React.ReactNode }) {
  return (
    // 外层容器：确保占据外部视窗，采用垂直布局，设定背景为白色和清晰的字体颜色
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-white text-slate-900">
      {/* 顶部主体内容：水平布局 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧固定宽度的导航栏 */}
        <DocSidebar />

        {/* 右侧主内容区：自适应剩余宽度，允许独立滚动 */}
        <main className="flex-1 overflow-y-auto py-12">{children}</main>
      </div>
    </div>
  );
}
