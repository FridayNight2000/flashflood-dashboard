import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import type { stationRecords, stations } from '@/lib/schema';

export type Station = InferSelectModel<typeof stations>;
export type NewStation = InferInsertModel<typeof stations>;
export type StationRecord = InferSelectModel<typeof stationRecords>;
export type NewStationRecord = InferInsertModel<typeof stationRecords>;
