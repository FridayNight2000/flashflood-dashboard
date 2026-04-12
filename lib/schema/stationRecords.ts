import { index, pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core';

import { stations } from './stations';

export const stationRecords = pgTable(
  'station_records',
  {
    id: serial('id').primaryKey(),
    station_id: text('station_id')
      .notNull()
      .references(() => stations.station_id),
    start_time: timestamp('start_time', { mode: 'string' }),
    peak_time: timestamp('peak_time', { mode: 'string' }),
    end_time: timestamp('end_time', { mode: 'string' }),
    start_value: real('start_value'),
    peak_value: real('peak_value'),
    end_value: real('end_value'),
    rise_time: real('rise_time'),
    fall_time: real('fall_time'),
  },
  (table) => [
    index('idx_records_peak_value').on(table.peak_value),
    index('idx_records_station_time').on(table.station_id, table.peak_time),
    index('idx_records_peak_time').on(table.peak_time),
  ],
);
