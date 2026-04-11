'use client';

import './CrtShell.css';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type CrtShellProps = {
  expanded?: boolean;
  children: React.ReactNode;
  className?: string;
  styleVars?: React.CSSProperties & { [key: `--${string}`]: string };
};

export default function CrtShell({ expanded, children, className, styleVars }: CrtShellProps) {
  const pathname = usePathname();

  const shellClasses = [
    'w-[var(--shell-width,820px)] max-w-[98vw] rounded-t-[28px] rounded-b-[20px] pt-[50px] px-8 pb-8 relative',
    'crt-shell',
    expanded
      ? '[--shell-width:min(1320px,97vw)] pt-[52px] px-7 pb-7 [&_.crt-screen]:[--screen-height:min(82vh,760px)]'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="h-screen overflow-hidden bg-[url('/rainfall.png')] bg-cover flex items-center justify-center p-5 font-mono">
      <div
        className={shellClasses}
        style={styleVars}
      >
        <div
          className={`absolute top-[18px] left-9 right-9 flex items-center z-10 ${pathname === '/' ? 'justify-center' : 'justify-between'}`}
        >
          {pathname !== '/' && (
            <nav className="flex gap-5">
              <Link
                href="/database"
                className={`crt-nav-btn font-mono text-[11px] no-underline uppercase tracking-[2px] py-1 px-3 rounded-md flex items-center gap-2 transition-all duration-150 select-none ${pathname.startsWith('/database') ? 'crt-nav-btn-active text-[#eee]' : 'text-[#777]'}`}
              >
                <span className="block w-1.5 h-1.5 rounded-full crt-nav-indicator transition-all duration-300" /> DATABASE
              </Link>
              <Link
                href="/doc"
                className={`crt-nav-btn font-mono text-[11px] no-underline uppercase tracking-[2px] py-1 px-3 rounded-md flex items-center gap-2 transition-all duration-150 select-none ${pathname.startsWith('/doc') ? 'crt-nav-btn-active text-[#eee]' : 'text-[#777]'}`}
              >
                <span className="block w-1.5 h-1.5 rounded-full crt-nav-indicator transition-all duration-300" /> DOC
              </Link>
              <Link
                href="/prep"
                className={`crt-nav-btn font-mono text-[11px] no-underline uppercase tracking-[2px] py-1 px-3 rounded-md flex items-center gap-2 transition-all duration-150 select-none ${pathname.startsWith('/prep') ? 'crt-nav-btn-active text-[#eee]' : 'text-[#777]'}`}
              >
                <span className="block w-1.5 h-1.5 rounded-full crt-nav-indicator transition-all duration-300" /> PREP
              </Link>
            </nav>
          )}
          <div className="font-mono text-[10px] text-[#444] tracking-[5px] whitespace-nowrap select-none">KINOUCHI LABORATORY</div>
        </div>

        <div className="bg-black rounded-[14px] p-[5px] crt-bezel">
          <div className="crt-screen bg-[var(--bg-screen,#000)] rounded-[10px] overflow-hidden relative flex flex-col h-[var(--screen-height,520px)]">
            <div className="flex-1 relative z-[1] overflow-hidden">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
