import { relations } from "drizzle-orm/relations";

import { stationRecords, stations } from "../lib/schema";

export const stationRecordsRelations = relations(stationRecords, ({ one }) => ({
	station: one(stations, {
		fields: [stationRecords.station_id],
		references: [stations.station_id]
	}),
}));

export const stationsRelations = relations(stations, ({ many }) => ({
	stationRecords: many(stationRecords),
}));
