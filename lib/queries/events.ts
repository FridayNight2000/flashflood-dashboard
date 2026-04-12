import { and, asc, desc, eq, gte, lte, type SQL, sql } from 'drizzle-orm';

import { db } from '../db';
import { stationRecords, stations } from '../schema';

export interface EventFilter {
  basinName: string;
  startTs?: string | null;
  endTs?: string | null;
  limit?: number;
}

export interface StationEventFilter {
  stationId: string;
  startTs?: string | null;
  endTs?: string | null;
  limit?: number;
}

function dateRange(filter: { startTs?: string | null; endTs?: string | null }) {
  const clauses: SQL[] = [];
  if (filter.startTs) clauses.push(gte(stationRecords.peak_time, filter.startTs));
  if (filter.endTs) clauses.push(lte(stationRecords.peak_time, filter.endTs));
  return clauses;
}

function basinJoinWhere(filter: EventFilter) {
  return and(eq(stations.basin_name, filter.basinName), ...dateRange(filter));
}

function stationWhere(filter: StationEventFilter) {
  return and(eq(stationRecords.station_id, filter.stationId), ...dateRange(filter));
}

//SECTION basin queries
// 查询函数,输入basinName,然后basinName 和stations.basin_name进行匹配到station_ids,
// 再和stationRecords 中的station_id进行匹配,查询,返回处于此basin中的所有events的统计信息
export async function queryBasinSummary(basinName: string) {
  const [row] = await db
    .select({
      totalEvents: sql<number>`count(${stationRecords.id})`,
      firstStartTime: sql<string | null>`min(${stationRecords.start_time})`,
      lastEndTime: sql<string | null>`max(${stationRecords.end_time})`,
      minPeakTime: sql<string | null>`min(${stationRecords.peak_time})`,
      maxPeakTime: sql<string | null>`max(${stationRecords.peak_time})`,
    })
    .from(stationRecords)
    .innerJoin(stations, eq(stationRecords.station_id, stations.station_id))
    .where(eq(stations.basin_name, basinName));
  return row;
}

//
export async function queryFilteredSummary(filter: EventFilter) {
  const [row] = await db
    .select({
      matchedEvents: sql<number>`count(${stationRecords.id})`,
      maxPeakValue: sql<number | null>`max(${stationRecords.peak_value})`,
      avgPeakValue: sql<number | null>`avg(${stationRecords.peak_value})`,
      avgRiseTime: sql<number | null>`avg(${stationRecords.rise_time})`,
      avgFallTime: sql<number | null>`avg(${stationRecords.fall_time})`,
    })
    .from(stationRecords)
    .innerJoin(stations, eq(stationRecords.station_id, stations.station_id))
    .where(basinJoinWhere(filter));
  return row;
}

export async function queryMatchedSeries(filter: EventFilter) {
  return db
    .select({
      id: stationRecords.id,
      peak_time: stationRecords.peak_time,
      peak_value: stationRecords.peak_value,
    })
    .from(stationRecords)
    .innerJoin(stations, eq(stationRecords.station_id, stations.station_id))
    .where(basinJoinWhere(filter))
    .orderBy(asc(stationRecords.peak_time))
    .limit(filter.limit ?? 2000);
}

export async function queryMatchedEvents(filter: EventFilter) {
  return db
    .select({
      id: stationRecords.id,
      station_id: stationRecords.station_id,
      basin_name: stations.basin_name,
      start_time: stationRecords.start_time,
      peak_time: stationRecords.peak_time,
      end_time: stationRecords.end_time,
      start_value: stationRecords.start_value,
      peak_value: stationRecords.peak_value,
      end_value: stationRecords.end_value,
      rise_time: stationRecords.rise_time,
      fall_time: stationRecords.fall_time,
    })
    .from(stationRecords)
    .innerJoin(stations, eq(stationRecords.station_id, stations.station_id))
    .where(basinJoinWhere(filter))
    .orderBy(asc(stationRecords.peak_time))
    .limit(filter.limit ?? 2000);
}

export async function queryStationSummary(stationId: string) {
  const [row] = await db
    .select({
      totalEvents: sql<number>`count(${stationRecords.id})`,
      firstStartTime: sql<string | null>`min(${stationRecords.start_time})`,
      lastEndTime: sql<string | null>`max(${stationRecords.end_time})`,
      minPeakTime: sql<string | null>`min(${stationRecords.peak_time})`,
      maxPeakTime: sql<string | null>`max(${stationRecords.peak_time})`,
    })
    .from(stationRecords)
    .where(eq(stationRecords.station_id, stationId));
  return row;
}
//!SECTION

//SECTION station queries

export async function queryStationFilteredSummary(filter: StationEventFilter) {
  const [row] = await db
    .select({
      matchedEvents: sql<number>`count(${stationRecords.id})`,
      maxPeakValue: sql<number | null>`max(${stationRecords.peak_value})`,
      avgPeakValue: sql<number | null>`avg(${stationRecords.peak_value})`,
      avgRiseTime: sql<number | null>`avg(${stationRecords.rise_time})`,
      avgFallTime: sql<number | null>`avg(${stationRecords.fall_time})`,
    })
    .from(stationRecords)
    .where(stationWhere(filter));
  return row;
}

export async function queryStationMatchedSeries(filter: StationEventFilter) {
  return db
    .select({
      id: stationRecords.id,
      peak_time: stationRecords.peak_time,
      peak_value: stationRecords.peak_value,
    })
    .from(stationRecords)
    .where(stationWhere(filter))
    .orderBy(asc(stationRecords.peak_time))
    .limit(filter.limit ?? 2000);
}

export async function queryStationRecentEvents(stationId: string, limit: number) {
  return db
    .select({
      id: stationRecords.id,
      start_time: stationRecords.start_time,
      peak_time: stationRecords.peak_time,
      end_time: stationRecords.end_time,
      start_value: stationRecords.start_value,
      peak_value: stationRecords.peak_value,
      end_value: stationRecords.end_value,
      rise_time: stationRecords.rise_time,
      fall_time: stationRecords.fall_time,
    })
    .from(stationRecords)
    .where(eq(stationRecords.station_id, stationId))
    .orderBy(desc(stationRecords.peak_time))
    .limit(limit);
}

export async function queryStationMatchedEvents(filter: StationEventFilter) {
  return db
    .select({
      id: stationRecords.id,
      station_id: stationRecords.station_id,
      start_time: stationRecords.start_time,
      peak_time: stationRecords.peak_time,
      end_time: stationRecords.end_time,
      start_value: stationRecords.start_value,
      peak_value: stationRecords.peak_value,
      end_value: stationRecords.end_value,
      rise_time: stationRecords.rise_time,
      fall_time: stationRecords.fall_time,
    })
    .from(stationRecords)
    .where(stationWhere(filter))
    .orderBy(asc(stationRecords.peak_time))
    .limit(filter.limit ?? 2000);
}
