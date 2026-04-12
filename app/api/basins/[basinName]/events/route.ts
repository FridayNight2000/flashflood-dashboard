import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { parseBoolean, parseDateOnly, parsePositiveInt } from '../../../../../lib/apiUtils';
import {
  queryBasinSummary,
  queryFilteredSummary,
  queryMatchedEvents,
  queryMatchedSeries,
} from '../../../../../lib/queries/events';

export async function GET(req: NextRequest, context: { params: Promise<{ basinName: string }> }) {
  try {
    const { basinName } = await context.params;
    const cleanBasin = decodeURIComponent(basinName).trim();
    if (!cleanBasin) {
      return NextResponse.json({ error: 'basinName is required.' }, { status: 400 });
    }

    const sp = req.nextUrl.searchParams;
    const includeMatchedSeries = parseBoolean(sp.get('includeMatchedSeries'), false);
    const includeMatchedEvents = parseBoolean(sp.get('includeMatchedEvents'), false);
    const countOnly = parseBoolean(sp.get('countOnly'), false);

    let peakStart = parseDateOnly(sp.get('peakStart'));
    let peakEnd = parseDateOnly(sp.get('peakEnd'));
    if (peakStart && peakEnd && peakStart > peakEnd) [peakStart, peakEnd] = [peakEnd, peakStart];

    const startTs = peakStart ? `${peakStart} 00:00:00` : null;
    const endTs = peakEnd ? `${peakEnd} 23:59:59` : null;
    const matchedLimit = parsePositiveInt(sp.get('matchedLimit'), 2000, 5000);
    const filter = { basinName: cleanBasin, startTs, endTs, limit: matchedLimit };

    const filteredSummary = await queryFilteredSummary(filter);
    const matchedEvents = filteredSummary.matchedEvents ?? 0;

    if (countOnly) {
      return NextResponse.json({ basinName: cleanBasin, matchedEvents });
    }

    const [summary, matchedSeriesData, matchedEventsData] = await Promise.all([
      queryBasinSummary(cleanBasin),
      includeMatchedSeries ? queryMatchedSeries(filter) : Promise.resolve(undefined),
      includeMatchedEvents ? queryMatchedEvents(filter) : Promise.resolve(undefined),
    ]);
    const totalEvents = summary.totalEvents ?? 0;

    return NextResponse.json({
      basinName: cleanBasin,
      summary: {
        totalEvents,
        matchedEvents,
        firstStartTime: summary.firstStartTime,
        lastEndTime: summary.lastEndTime,
        minPeakTime: summary.minPeakTime,
        maxPeakTime: summary.maxPeakTime,
        maxPeakValue: filteredSummary.maxPeakValue,
        avgPeakValue: filteredSummary.avgPeakValue,
        avgRiseTime: filteredSummary.avgRiseTime,
        avgFallTime: filteredSummary.avgFallTime,
      },
      recentEvents: [],
      matchedSeries: matchedSeriesData,
      matchedEventsDetail: matchedEventsData,
    }, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('[GET /api/basins/[basinName]/events]', error);
    return NextResponse.json(
      { error: 'Failed to query basin events.' },
      { status: 500 },
    );
  }
}
