import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { queryStations } from '../../../lib/queries/stations';

export const runtime = 'nodejs';

// 作用：将 URL 查询参数中的字符串安全地解析为正整数，超出上限则截断
// 输入：value —— 原始字符串（可为 null）；fallback —— 解析失败时的默认值；max —— 允许的最大值
// 输出：解析后的正整数，若无效则返回 fallback
// 为什么这样写：API 层需要统一防御非法参数（负数、NaN、超大值），避免将异常值传入数据库查询
function parsePositiveInt(value: string | null, fallback: number, max: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

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
    const pageSize = parsePositiveInt(searchParams.get('pageSize'), 200, Number.MAX_SAFE_INTEGER);

    const result = await queryStations({ q, hasData, page, pageSize });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[GET /api/stations]', error);
    return NextResponse.json({ error: 'Failed to query stations.' }, { status: 500 });
  }
}
