'use client';

import React, { useCallback, useRef, useState } from 'react';

import { useWizardContext } from '@/lib/hydro/context';
import { getDateRange, scanFiles } from '@/lib/hydro/parser/fileScanner';

export default function StepUpload() {
  const { state, dispatch } = useWizardContext();
  const canUpload = state.stationId.trim().length > 0;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  /* ─── derived file counts ─── */
  const hasFiles = state.uploadedFiles.length > 0;

  /* ─── file handling ─── */
  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) => /\.txt$/i.test(f.name));
      if (arr.length === 0) return;
      dispatch({ type: 'SET_UPLOADED_FILES', payload: arr });
    },
    [dispatch],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  /* ─── drag & drop ─── */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const items = e.dataTransfer.items;
      if (items && items.length > 0) {
        const allFiles: File[] = [];

        const readAllEntries = (reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> =>
          new Promise((resolve) => {
            const all: FileSystemEntry[] = [];
            const read = () =>
              reader.readEntries((entries) => {
                if (entries.length === 0) {
                  resolve(all);
                  return;
                }
                all.push(...entries);
                read();
              });
            read();
          });

        const readEntry = (entry: FileSystemEntry): Promise<File[]> =>
          new Promise((resolve) => {
            if (entry.isFile) {
              (entry as FileSystemFileEntry).file((f) => resolve([f]));
            } else if (entry.isDirectory) {
              const reader = (entry as FileSystemDirectoryEntry).createReader();
              readAllEntries(reader).then(async (entries) => {
                const nested = await Promise.all(entries.map(readEntry));
                resolve(nested.flat());
              });
            } else {
              resolve([]);
            }
          });

        for (let i = 0; i < items.length; i++) {
          const entry = items[i].webkitGetAsEntry?.();
          if (entry) {
            const files = await readEntry(entry);
            allFiles.push(...files);
          }
        }

        if (allFiles.length > 0) {
          processFiles(allFiles);
          return;
        }
      }

      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  return (
    <div className="space-y-6">
      {/* --- Folder Upload Area --- */}
      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-15 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : hasFiles
              ? 'border-emerald-400 bg-emerald-50/40'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/30'
        } `}
      >
        {hasFiles ? (
          <svg
            className="mb-3 h-10 w-10 text-emerald-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            className={`mb-3 h-10 w-10 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
            />
          </svg>
        )}

        {hasFiles ? (
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              {state.uploadedFiles.length} TXT files selected
            </p>
            <p className="mt-2 text-xs text-gray-400">Click or drag to re-select</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-600">
              {isDragOver ? 'Drop to upload folder' : 'Click to select folder or drag here'}
            </p>
            <p className="mt-1 text-xs text-gray-400">Only .txt files are processed</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
          /* @ts-expect-error -- webkitdirectory is a non-standard attribute */
          webkitdirectory=""
          directory=""
          multiple
        />
      </div>
      {/* --- Station ID + Button --- */}
      <div className="flex items-end space-x-6">
        <div className="flex-1 space-y-2">
          <label
            htmlFor="station-id"
            className="block text-sm font-medium text-gray-600"
          >
            Station ID :
          </label>
          <input
            id="station-id"
            type="text"
            value={state.stationId}
            onChange={(e) => dispatch({ type: 'SET_STATION_ID', payload: e.target.value })}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="e.g. 30514200"
          />
        </div>
        <button
          disabled={!canUpload || !hasFiles}
          onClick={() => {
            const scanned = scanFiles(state.uploadedFiles);
            dispatch({ type: 'SET_SCANNED_FILES', payload: scanned });
            dispatch({ type: 'SET_DATE_RANGE', payload: getDateRange(scanned) });
            dispatch({ type: 'SET_STEP', payload: 2 });
          }}
          className="h-[42px] rounded-md bg-blue-600 px-8 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          SCAN
        </button>
      </div>
    </div>
  );
}
