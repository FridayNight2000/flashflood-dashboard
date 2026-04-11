import { cn } from '@/lib/utils';
import type { Station } from '@/types';

import type { ActiveTab, BasinTabData } from '../types';
import { BasinBadgeIcon, StationBadgeIcon } from './PanelIcons';

type PanelTabBarProps = {
  activeTab: ActiveTab;
  basinTab: BasinTabData | null;
  stationTab: Station | null;
  onActivateBasinTab: () => void;
  onActivateStationTab: () => void;
  onCloseBasinTab: () => void;
  onCloseStationTab: () => void;
  getDisplayName: (station: Station) => string;
};

export default function PanelTabBar({
  activeTab,
  basinTab,
  stationTab,
  onActivateBasinTab,
  onActivateStationTab,
  onCloseBasinTab,
  onCloseStationTab,
  getDisplayName,
}: PanelTabBarProps) {
  return (
    <div className={'bg-[oklch(0.97_0_0)] px-[0.6rem] pt-2 pb-0'}>
      <div className={'relative'}>
        <div
          className={
            'flex snap-x snap-proximity items-end gap-[0.22rem] overflow-x-auto overflow-y-hidden px-[0.15rem] pb-0 whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          }
          role="tablist"
          aria-label="Panel tabs"
        >
          {basinTab && (
            <div
              className={cn(
                'relative z-10 inline-flex max-w-[min(270px,58vw)] min-w-0 flex-none translate-y-[1px] snap-start items-center rounded-t-xl max-[900px]:max-w-[min(230px,64vw)]',
                activeTab === 'basin' && 'z-30 translate-y-0 bg-white',
              )}
            >
              <button
                type="button"
                id="tab-basin"
                className={cn(
                  'flex max-w-full min-w-0 flex-1 items-center gap-2 overflow-hidden border-0 bg-transparent py-[0.42rem] pr-[0.4rem] pl-[0.66rem] text-left text-[0.84rem] leading-[1.2] text-ellipsis whitespace-nowrap text-slate-900',
                  'max-[900px]:pl-[0.56rem] max-[900px]:text-[0.82rem]',
                  activeTab !== 'basin' && 'cursor-pointer',
                  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7fb1d1]',
                )}
                role="tab"
                aria-selected={activeTab === 'basin'}
                aria-controls="tabpanel-basin"
                tabIndex={activeTab === 'basin' ? 0 : -1}
                onClick={onActivateBasinTab}
              >
                <BasinBadgeIcon />
                <span className="truncate">{basinTab.basinName}</span>
              </button>
              <div className={'flex flex-none items-center pr-[0.22rem]'}>
                <button
                  type="button"
                  className={
                    'h-6 w-6 cursor-pointer rounded-lg border-0 bg-transparent p-0 text-[0.96rem] leading-none font-bold text-slate-700 transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7fb1d1]'
                  }
                  aria-label="Close basin tab"
                  onClick={onCloseBasinTab}
                >
                  ×
                </button>
              </div>
            </div>
          )}
          {stationTab && (
            <div
              className={cn(
                'relative z-10 inline-flex max-w-[min(270px,58vw)] min-w-0 flex-none translate-y-[1px] snap-start items-center rounded-t-xl max-[900px]:max-w-[min(230px,64vw)]',
                activeTab === 'station' && 'z-30 translate-y-0 bg-white',
              )}
            >
              <button
                type="button"
                id="tab-station"
                className={cn(
                  'flex max-w-full min-w-0 flex-1 items-center gap-2 overflow-hidden border-0 bg-transparent py-[0.42rem] pr-[0.4rem] pl-[0.66rem] text-left text-[0.84rem] leading-[1.2] text-ellipsis whitespace-nowrap text-slate-900',
                  'max-[900px]:pl-[0.56rem] max-[900px]:text-[0.82rem]',
                  activeTab !== 'station' && 'cursor-pointer',
                  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7fb1d1]',
                )}
                role="tab"
                aria-selected={activeTab === 'station'}
                aria-controls="tabpanel-station"
                tabIndex={activeTab === 'station' ? 0 : -1}
                onClick={onActivateStationTab}
              >
                <StationBadgeIcon />
                <span className="truncate">{getDisplayName(stationTab)}</span>
              </button>
              <div className={'flex flex-none items-center pr-[0.22rem]'}>
                <button
                  type="button"
                  className={
                    'h-6 w-6 cursor-pointer rounded-lg border-0 bg-transparent p-0 text-[0.96rem] leading-none font-bold text-slate-700 transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7fb1d1]'
                  }
                  aria-label="Close station tab"
                  onClick={onCloseStationTab}
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
