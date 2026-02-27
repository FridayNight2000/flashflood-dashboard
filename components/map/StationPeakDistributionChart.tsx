'use client';

import { forwardRef, useMemo } from 'react';

import type { PeakDistributionPoint } from '@/app/map/types';

type StationPeakDistributionChartProps = {
  points: PeakDistributionPoint[];
  title?: string;
  width?: number;
  height?: number;
};

type ChartPoint = {
  x: number;
  y: number;
  rank: number;
  peak_value: number;
};

const chartMargin = { top: 30, right: 24, bottom: 42, left: 52 };

function formatValue(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : '-';
}

const StationPeakDistributionChart = forwardRef<SVGSVGElement, StationPeakDistributionChartProps>(
  function StationPeakDistributionChart(
    { points, title = 'Peak distribution', width = 640, height = 260 },
    ref,
  ) {
    const plotWidth = width - chartMargin.left - chartMargin.right;
    const plotHeight = height - chartMargin.top - chartMargin.bottom;

    const chartData = useMemo(() => {
      if (points.length === 0) {
        return {
          linePath: '',
          points: [] as ChartPoint[],
          xTicks: [] as {
            x: number;
            label: string;
            align: 'start' | 'middle' | 'end';
          }[],
          yTicks: [] as { y: number; label: string }[],
        };
      }

      const sorted = [...points].sort((a, b) => a.rank - b.rank);
      const maxRank = Math.max(1, sorted[sorted.length - 1].rank);
      const values = sorted.map((item) => item.peak_value);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const ySpan = Math.max(0.0001, maxValue - minValue);

      const mappedPoints = sorted.map((item) => {
        const xRatio = maxRank === 1 ? 0 : (item.rank - 1) / (maxRank - 1);
        const yRatio = (item.peak_value - minValue) / ySpan;
        return {
          x: chartMargin.left + xRatio * plotWidth,
          y: chartMargin.top + (1 - yRatio) * plotHeight,
          rank: item.rank,
          peak_value: item.peak_value,
        };
      });

      const linePath = mappedPoints
        .map((point, idx) => `${idx === 0 ? 'M' : 'L'}${point.x},${point.y}`)
        .join(' ');

      const xTicks: Array<{
        x: number;
        label: string;
        align: 'start' | 'middle' | 'end';
      }> = Array.from({ length: 5 }).map((_, idx) => {
        const ratio = idx / 4;
        const rank = Math.round(1 + ratio * (maxRank - 1));
        return {
          x: chartMargin.left + ratio * plotWidth,
          label: `${rank}`,
          align: idx === 0 ? 'start' : idx === 4 ? 'end' : 'middle',
        };
      });

      const yTicks = Array.from({ length: 5 }).map((_, idx) => {
        const ratio = idx / 4;
        const value = maxValue - ratio * ySpan;
        return {
          y: chartMargin.top + ratio * plotHeight,
          label: formatValue(value),
        };
      });

      return {
        linePath,
        points: mappedPoints,
        xTicks,
        yTicks,
      };
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

        {chartData.xTicks.map((tick) => (
          <g key={`${tick.x}-${tick.label}`}>
            <line
              x1={tick.x}
              y1={chartMargin.top}
              x2={tick.x}
              y2={height - chartMargin.bottom}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text
              x={tick.x}
              y={height - chartMargin.bottom + 15}
              textAnchor={tick.align}
              fontSize="10"
              fill="#475569"
            >
              {tick.label}
            </text>
          </g>
        ))}

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

        {chartData.linePath && (
          <path
            d={chartData.linePath}
            fill="none"
            stroke="#0f766e"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {chartData.points.map((point) => (
          <circle
            key={point.rank}
            cx={point.x}
            cy={point.y}
            r="2"
            fill="#0f766e"
          >
            <title>{`rank ${point.rank} | ${formatValue(point.peak_value)}`}</title>
          </circle>
        ))}

        <text
          x={width / 2}
          y={height - 2}
          textAnchor="middle"
          fontSize="11"
          fill="#334155"
        >
          rank
        </text>
        <text
          x={13}
          y={height / 2}
          textAnchor="middle"
          fontSize="11"
          fill="#334155"
          transform={`rotate(-90 13 ${height / 2})`}
        >
          peak_value
        </text>
      </svg>
    );
  },
);

export default StationPeakDistributionChart;
