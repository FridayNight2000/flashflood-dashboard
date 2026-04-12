import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { parsePositiveInt } from '../../../lib/apiUtils';
import { queryStations } from '../../../lib/queries/stations';

// 作用：Next.js Route Handler —— 对外暴露 GET /api/stations，供 LeafletMap 初始化时分页拉取全部监测站列表
// 输入：URL 查询参数 q（搜索关键字）、hasData（是否有数据）、page（页码）、pageSize（每页条数，无上限）
// 输出：JSON —— { stations, total, page, pageSize }（由 queryStations 决定具体结构）；出错时返回 500 + error 字段
// 为什么这样写：Leaflet 地图需要一次性加载所有站点坐标（pageSize=1000 循环），故此路由需支持大分页；
//   同时保留 q / hasData 过滤，供工具栏搜索复用同一接口，避免重复 API
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() ?? '';
    const hasData = searchParams.get('hasData');
    const page = parsePositiveInt(searchParams.get('page'), 1, Number.MAX_SAFE_INTEGER);
    const pageSize = parsePositiveInt(searchParams.get('pageSize'), 200, 2500);

    const result = await queryStations({ q, hasData, page, pageSize });
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('[GET /api/stations]', error);
    return NextResponse.json({ error: 'Failed to query stations.' }, { status: 500 });
  }
}
