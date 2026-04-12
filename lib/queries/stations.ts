import { and, asc, desc, eq, like, or, sql } from 'drizzle-orm';

import { db } from '../db';
import { stations } from '../schema';

export interface StationFilter {
  q?: string;
  hasData?: string | null;
  page?: number;
  pageSize?: number;
}

export async function queryStations(filter: StationFilter) {
  const { q = '', hasData, page = 1, pageSize = 200 } = filter;
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (q) {
    const escaped = q.replace(/%/g, '\\%').replace(/_/g, '\\_');
    const kw = `%${escaped}%`;
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

  const rows = await db
    .select({
      station: stations,
      totalCount: sql<number>`count(*) over()`,
    })
    .from(stations)
    .where(where)
    .orderBy(desc(stations.has_data), asc(stations.station_id))
    .limit(pageSize)
    .offset(offset);

  const items = rows.map((row) => row.station);
  const total =
    rows[0]?.totalCount ??
    (
      await db
        .select({ total: sql<number>`count(*)` })
        .from(stations)
        .where(where)
    )[0]?.total ??
    0;

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
