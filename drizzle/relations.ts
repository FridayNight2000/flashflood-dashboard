import { relations } from "drizzle-orm/relations";

import { stationRecords,stations } from "./schema";

export const stationRecordsRelations = relations(stationRecords, ({one}) => ({
	station: one(stations, {
		fields: [stationRecords.stationId],
		references: [stations.stationId]
	}),
}));

export const stationsRelations = relations(stations, ({many}) => ({
	stationRecords: many(stationRecords),
}));