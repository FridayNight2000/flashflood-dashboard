import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const stations = sqliteTable(
  'stations',
  {
    stationId: text('station_id').primaryKey(),
    latitude: real(),
    longitude: real(),
    basinName: text('basin_name'),
    riverName: text('river_name'),
    stationName: text('station_name'),
    stationName2: text('station_name2'),
    stationName3: text('station_name3'),
    description: text(),
    hasData: integer('has_data').default(0),
  },
  (table) => [
    index('idx_stations_has_data').on(table.hasData),
    index('idx_stations_basin').on(table.basinName),
    index('idx_stations_river').on(table.riverName),
  ],
);

export const stationRecords = sqliteTable(
  'station_records',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    stationId: text('station_id').references(() => stations.stationId),
    startTime: text('start_time'),
    peakTime: text('peak_time'),
    endTime: text('end_time'),
    startValue: real('start_value'),
    peakValue: real('peak_value'),
    endValue: real('end_value'),
    riseTime: real('rise_time'),
    fallTime: real('fall_time'),
    peakTimeStr: text('peak_time_str'),
  },
  (table) => [
    index('idx_records_peak_value').on(table.peakValue),
    index('idx_records_station_time').on(table.stationId, table.peakTime),
    index('idx_records_peak_time').on(table.peakTime),
  ],
);
