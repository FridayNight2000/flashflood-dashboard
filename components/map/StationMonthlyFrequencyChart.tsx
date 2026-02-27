'use client';

import { forwardRef, useMemo } from 'react';

import type { MonthlyFrequencyPoint } from '@/app/map/types';

type StationMonthlyFrequencyChartProps = {
  points: MonthlyFrequencyPoint[];
  title?: string;
  width?: number;
  height?: number;
};

const chartMargin = { top: 30, right: 24, bottom: 42, left: 44 };

const StationMonthlyFrequencyChart = forwardRef<SVGSVGElement, StationMonthlyFrequencyChartProps>(
  function StationMonthlyFrequencyChart(
    { points, title = 'Seasonality frequency', width = 640, height = 260 },
    ref,
  ) {
    const plotWidth = width - chartMargin.left - chartMargin.right;
    const plotHeight = height - chartMargin.top - chartMargin.bottom;

    const chartData = useMemo(() => {
      const safePoints = points
        .filter((item) => item.month >= 1 && item.month <= 12)
        .sort((a, b) => a.month - b.month);

      const maxCount = Math.max(1, ...safePoints.map((item) => item.count));
      const barGap = 6;
      const barWidth = (plotWidth - barGap * 11) / 12;

      const bars = safePoints.map((item, index) => {
        const ratio = item.count / maxCount;
        const barHeight = ratio * plotHeight;
        const x = chartMargin.left + index * (barWidth + barGap);
        const y = chartMargin.top + (plotHeight - barHeight);
        return {
          month: item.month,
          x,
          y,
          width: barWidth,
          height: barHeight,
          label: `${item.month} month`,
          count: item.count,
        };
      });

      const yTicks = Array.from({ length: 5 }).map((_, idx) => {
        const ratio = idx / 4;
        const value = Math.round(maxCount * (1 - ratio));
        return {
          y: chartMargin.top + ratio * plotHeight,
          label: `${value}`,
        };
      });

      return { bars, yTicks };
    }, [plotHeight, plotWidth, points]);

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        role="img"
        aria-label={`${title} chart`}
      >
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="#ffffff"
        />
        <text
          x={width / 2}
          y={16}
          textAnchor="middle"
          fontSize="12"
          fill="#0f172a"
        >
          {title}
        </text>
        <rect
          x={chartMargin.left}
          y={chartMargin.top}
          width={plotWidth}
          height={plotHeight}
          fill="#f8fafc"
          stroke="#dbe3ea"
        />
        <line
          x1={chartMargin.left}
          y1={height - chartMargin.bottom}
          x2={width - chartMargin.right}
          y2={height - chartMargin.bottom}
          stroke="#64748b"
          strokeWidth="1"
        />
        <line
          x1={chartMargin.left}
          y1={chartMargin.top}
          x2={chartMargin.left}
          y2={height - chartMargin.bottom}
          stroke="#64748b"
          strokeWidth="1"
        />

        {chartData.yTicks.map((tick, idx) => (
          <g key={`${tick.y}-${tick.label}`}>
            <line
              x1={chartMargin.left}
              y1={tick.y}
              x2={width - chartMargin.right}
              y2={tick.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text
              x={chartMargin.left - 8}
              y={idx === chartData.yTicks.length - 1 ? tick.y - 3 : tick.y + 3}
              textAnchor="end"
              fontSize="10"
              fill="#475569"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {chartData.bars.map((bar) => (
          <g key={bar.label}>
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx="2"
              fill="#0f766e"
              opacity="0.9"
            >
              <title>{`${bar.label}: ${bar.count}`}</title>
            </rect>
            <text
              x={bar.x + bar.width / 2}
              y={height - chartMargin.bottom + 15}
              textAnchor="middle"
              fontSize="10"
              fill="#475569"
            >
              {bar.month}
            </text>
          </g>
        ))}

        <text
          x={width / 2}
          y={height - 2}
          textAnchor="middle"
          fontSize="11"
          fill="#334155"
        >
          month(peak_time)
        </text>
        <text
          x={13}
          y={height / 2}
          textAnchor="middle"
          fontSize="11"
          fill="#334155"
          transform={`rotate(-90 13 ${height / 2})`}
        >
          count
        </text>
      </svg>
    );
  },
);

export default StationMonthlyFrequencyChart;
