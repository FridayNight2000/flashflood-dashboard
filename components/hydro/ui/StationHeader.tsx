'use client';

interface StationHeaderProps {
  stationId: string;
  children?: React.ReactNode;
}

export default function StationHeader({ stationId, children }: StationHeaderProps) {
  return (
    <div className="flex items-center justify-between py-1 pr-3">
      <div className="flex items-center">
        <span className="text-black-600 flex h-7 w-7 items-center justify-center">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </span>
        <span className="font-mono font-bold tracking-tight text-gray-900">{stationId}</span>
      </div>
      {children}
    </div>
  );
}
