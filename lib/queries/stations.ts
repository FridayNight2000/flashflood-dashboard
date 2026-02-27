import { and, asc, desc, eq, like, or, sql } from 'drizzle-orm';

import { db } from '../db';
import { stations } from '../schema';

export interface StationFilter {
  q?: string;
  hasData?: string | null;
  page?: number;
  pageSize?: number;
}

export function queryStations(filter: StationFilter) {
  const { q = '', hasData, page = 1, pageSize = 200 } = filter;
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (q) {
    const kw = `%${q}%`;
    conditions.push(
      or(
        like(stations.station_id, kw),
        like(stations.station_name, kw),
        like(stations.station_name2, kw),
        like(stations.station_name3, kw),
        like(stations.river_name, kw),
        like(stations.basin_name, kw),
      )!,
    );
  }

  if (hasData === '1' || hasData === '0') {
    conditions.push(eq(stations.has_data, Number(hasData)));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRow] = db
    .select({ total: sql<number>`count(*)` })
    .from(stations)
    .where(where)
    .all();
  const total = countRow.total;

  const items = db
    .select()
    .from(stations)
    .where(where)
    .orderBy(desc(stations.has_data), asc(stations.station_id))
    .limit(pageSize)
    .offset(offset)
    .all();

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
