export type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

// Station type corresponding to fields returned by /api/stations.
export type Station = {
  station_id: string;
  latitude: number | null;
  longitude: number | null;
  basin_name: string | null;
  river_name: string | null;
  station_name: string | null;
  station_name2?: string | null;
  station_name3?: string | null;
  description?: string | null;
  has_data: number;
};

// API response type used for paginated station loading.
export type StationsApiResponse = {
  items: Station[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

// Aggregated event summary for a single station (used by side panel).
export type StationEventSummary = {
  totalEvents: number;
  matchedEvents: number;
  firstStartTime: string | null;
  lastEndTime: string | null;
  minPeakTime: string | null;
  maxPeakTime: string | null;
  maxPeakValue: number | null;
  avgPeakValue: number | null;
  avgRiseTime: number | null;
  avgFallTime: number | null;
};

// Recent events for a single station (used by side panel).
export type StationRecentEvent = {
  id: number;
  station_id?: string | null;
  basin_name?: string | null;
  start_time: string | null;
  peak_time: string | null;
  end_time: string | null;
  start_value: number | null;
  peak_value: number | null;
  end_value: number | null;
  rise_time: number | null;
  fall_time: number | null;
  peak_time_str: string | null;
};

export type StationMatchedPoint = {
  id: number;
  peak_time: string;
  peak_value: number;
  peak_time_str: string | null;
};

// API response type for single-station event aggregation.
export type StationEventsApiResponse = {
  stationId?: string;
  basinName?: string;
  summary: StationEventSummary;
  recentEvents: StationRecentEvent[];
  matchedSeries?: StationMatchedPoint[];
  matchedEventsDetail?: StationRecentEvent[];
};

// Lightweight count response for date-range filtering.
export type StationEventsCountResponse = {
  stationId?: string;
  basinName?: string;
  matchedEvents: number;
};
