export type ActiveTab = 'basin' | 'station' | null;

export type BasinTabData = {
  basinName: string;
  stationCount: number;
};

export type SearchSuggestion = {
  value: string;
  type: 'Basin' | 'Station';
};

export type SelectedSearchItem = {
  label: string;
  type: 'Basin' | 'Station';
};

export type MonthlyFrequencyPoint = {
  month: number;
  count: number;
};

export type PeakDistributionPoint = {
  rank: number;
  peak_value: number;
};
