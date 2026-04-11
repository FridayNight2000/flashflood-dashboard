'use client';

import { type SyntheticEvent, useRef, useState } from 'react';

import type { SearchSuggestion, SelectedSearchItem } from '../types';
import SearchLoadingIcon from './SearchLoadingIcon';

type MapSearchbarProps = {
  isLoading: boolean;
  error: string | null;
  searchText: string;
  searchHint: string;
  suggestions: SearchSuggestion[];
  selectedItem: SelectedSearchItem | null;
  onSearchTextChange: (value: string) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  onSuggestionSelect: (item: SearchSuggestion) => void;
};

function SearchInputIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 2h8v2H6V2zM4 6V4h2v2H4zm0 8H2V6h2v8zm2 2H4v-2h2v2zm8 0v2H6v-2h8zm2-2h-2v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm0-8h2v8h-2V6zm0 0V4h-2v2h2z"
        fill="currentColor"
      />
    </svg>
  );
}

function BasinBadgeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-slate-500"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.5 16.5a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm6.5 0a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm6.5 0a2 2 0 1 1 0 4a2 2 0 0 1 0-4ZM5.5 10a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm6.5 0a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm6.5 0a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm-13-6.5a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm6.5 0a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm6.5 0a2 2 0 1 1 0 4a2 2 0 0 1 0-4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StationBadgeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-slate-500"
      viewBox="0 0 432 432"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M213 109q44 0 75.5 31.5T320 216t-31.5 75.5T213 323t-75-31.5t-31-75.5t31-75.5t75-31.5zm.5-106q88.5 0 151 62.5T427 216t-62.5 150.5t-151 62.5t-151-62.5T0 216T62.5 65.5T213.5 3zm0 384q70.5 0 120.5-50t50-121t-50-121t-120.5-50T93 95T43 216t50 121t120.5 50z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function MapSearchbar({
  isLoading,
  error,
  searchText,
  searchHint,
  suggestions,
  selectedItem,
  onSearchTextChange,
  onSubmit,
  onSuggestionSelect,
}: MapSearchbarProps) {
  const DEFAULT_WIDTH_PX = 200;
  const MAX_LOCKED_WIDTH_PX = 360;
  const LOCKED_WIDTH_PER_CHAR_PX = 14;
  const BADGE_SIDE_PADDING_PX = 14;
  const BADGE_ICON_GAP_PX = 8;
  const BASIN_ICON_WIDTH_PX = 20;
  const STATION_ICON_WIDTH_PX = 16;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const showSelectedBadge = Boolean(selectedItem && !isInputFocused);

  const placeholder = isLoading
    ? 'Loading stations...'
    : error
      ? 'Stations unavailable'
      : 'Basin or station…';
  const displayValue = isInputFocused ? searchText : selectedItem ? selectedItem.label : searchText;

  const inputClassName =
    `w-full rounded-[10px] border-0 bg-transparent py-3 pr-3.5 pl-10 text-base font-[inherit] outline-none ${
      showSelectedBadge ? 'text-transparent caret-slate-900' : ''
    }`.trim();
  const badgeTextStartOffsetPx = selectedItem
    ? BADGE_SIDE_PADDING_PX +
      (selectedItem.type === 'Basin' ? BASIN_ICON_WIDTH_PX : STATION_ICON_WIDTH_PX) +
      BADGE_ICON_GAP_PX
    : 0;
  const lockedWidthPx = selectedItem
    ? Math.min(
        MAX_LOCKED_WIDTH_PX,
        badgeTextStartOffsetPx * 2 + selectedItem.label.length * LOCKED_WIDTH_PER_CHAR_PX,
      )
    : DEFAULT_WIDTH_PX;
  const containerWidth = showSelectedBadge
    ? `min(${lockedWidthPx}px, calc(100vw - 1.5rem))`
    : `min(${DEFAULT_WIDTH_PX}px, calc(100vw - 1.5rem))`;

  return (
    <div
      className="absolute top-3 left-3 z-1000 rounded-[10px] border border-gray-200 bg-white shadow-[0_4px_12px_rgba(15,23,42,0.08)] transition-[width] duration-150 ease-out focus-within:border-slate-300"
      style={{ width: containerWidth }}
    >
      <form onSubmit={onSubmit}>
        <div className="relative">
          {!showSelectedBadge && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              {isLoading ? <SearchLoadingIcon /> : <SearchInputIcon />}
            </div>
          )}
          {showSelectedBadge && selectedItem && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-2 px-3.5 text-gray-500">
              {selectedItem.type === 'Basin' ? <BasinBadgeIcon /> : <StationBadgeIcon />}
              <span className="truncate text-base">{selectedItem.label}</span>
            </div>
          )}
          <input
            ref={inputRef}
            className={`${inputClassName} map-search-input`}
            type="text"
            value={displayValue}
            onChange={(event) => onSearchTextChange(event.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder={placeholder}
            aria-label="Search by basin or station name"
          />
        </div>
      </form>
      {/* Search suggestion list: show prefix matches for basin_name + station_name. */}
      {isInputFocused && suggestions.length > 0 && (
        <ul className="mx-1.5 mt-0.5 mb-1.5 list-none overflow-hidden rounded-[10px] border border-gray-200 bg-white p-0">
          {suggestions.map((item) => (
            <li key={`${item.type}-${item.value}`}>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-white px-2.5 py-1.5 text-left font-[inherit] hover:bg-slate-50"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSuggestionSelect(item);
                  inputRef.current?.blur();
                }}
              >
                <span>{item.value}</span>
                <span className="text-xs whitespace-nowrap text-slate-500">{item.type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {searchHint && (
        <p className="map-search-hint mx-3 mb-2.5 text-center text-sm text-gray-600">
          {searchHint}
        </p>
      )}
    </div>
  );
}
