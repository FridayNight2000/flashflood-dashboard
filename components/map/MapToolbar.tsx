'use client';

import { type SyntheticEvent, useRef, useState } from 'react';

import type { SearchSuggestion, SelectedSearchItem } from '@/app/map/types';

import styles from './MapToolbar.module.css';

type MapToolbarProps = {
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

export default function MapToolbar({
  isLoading,
  error,
  searchText,
  searchHint,
  suggestions,
  selectedItem,
  onSearchTextChange,
  onSubmit,
  onSuggestionSelect,
}: MapToolbarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const placeholder = isLoading
    ? 'Loading stations...'
    : error
      ? 'Stations unavailable'
      : 'Search by basin / station';

  const displayValue = isInputFocused
    ? searchText
    : selectedItem
      ? `${selectedItem.label} -- ${selectedItem.type}`
      : searchText;

  const inputClassName = `${styles.mapInput} ${
    isInputFocused || !selectedItem ? '' : styles.mapInputMuted
  }`.trim();

  return (
    <div className={styles.mapToolbar}>
      <form onSubmit={onSubmit}>
        <input
          ref={inputRef}
          className={inputClassName}
          type="text"
          value={displayValue}
          onChange={(event) => onSearchTextChange(event.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          placeholder={placeholder}
        />
      </form>
      {/* Search suggestion list: show prefix matches for basin_name + station_name. */}
      {isInputFocused && suggestions.length > 0 && (
        <ul className={styles.mapSuggestions}>
          {suggestions.map((item) => (
            <li key={`${item.type}-${item.value}`}>
              <button
                type="button"
                className={styles.mapSuggestionBtn}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSuggestionSelect(item);
                  inputRef.current?.blur();
                }}
              >
                <span>{item.value}</span>
                <span className={styles.mapSuggestionType}>{item.type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {searchHint && <p className={styles.mapSearchHint}>{searchHint}</p>}
    </div>
  );
}
