import type { Station } from '@/types';

export function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function stationDisplayName(station: Station): string {
  return (
    station.station_name ||
    station.station_name2 ||
    station.station_name3 ||
    "Unknown station"
  );
}


