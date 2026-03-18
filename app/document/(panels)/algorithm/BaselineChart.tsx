'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function generateData() {
  const yearPoints = 365;
  const totalPoints = yearPoints * 3;
  const data = [];

  const seasonalAmplitude = 1.2;
  const referenceMean = 5.0;

  // distinct spikes for each year (positions relative to start of that year)
  const spikesY1 = [
    { pos: 180, height: 1.5 },
    { pos: 220, height: 2.5 },
  ];
  const spikesY2 = [
    { pos: 150, height: 1.2 },
    { pos: 190, height: 2.2 },
    { pos: 260, height: 1.8 },
  ];
  const spikesY3 = [
    { pos: 170, height: 1.8 },
    { pos: 240, height: 1.4 },
  ];

  for (let i = 0; i < totalPoints; i++) {
    const yearIndex = Math.floor(i / yearPoints); // 0, 1, or 2
    const dayOfYear = i % yearPoints;

    const t = (dayOfYear / yearPoints) * 2 * Math.PI;
    const season = 5 + seasonalAmplitude * -Math.cos(t);
    const noise = (Math.random() - 0.5) * 0.4;

    let spikeVal = 0;
    let offset = 0;

    if (yearIndex === 0) {
      offset = 0;
      for (const s of spikesY1) {
        const dist = Math.abs(dayOfYear - s.pos);
        if (dist < 10) spikeVal += s.height * Math.exp(-(dist * dist) / 8);
      }
    } else if (yearIndex === 1) {
      offset = 1.5;
      for (const s of spikesY2) {
        const dist = Math.abs(dayOfYear - s.pos);
        if (dist < 10) spikeVal += s.height * Math.exp(-(dist * dist) / 8);
      }
    } else {
      offset = -1.0;
      for (const s of spikesY3) {
        const dist = Math.abs(dayOfYear - s.pos);
        if (dist < 10) spikeVal += s.height * Math.exp(-(dist * dist) / 8);
      }
    }

    data.push({
      day: i,
      raw: season + noise + spikeVal + offset,
      year: yearIndex + 1,
    });
  }

  const m1 = data.filter((d) => d.year === 1).reduce((sum, d) => sum + d.raw, 0) / yearPoints;
  const m2 = data.filter((d) => d.year === 2).reduce((sum, d) => sum + d.raw, 0) / yearPoints;
  const m3 = data.filter((d) => d.year === 3).reduce((sum, d) => sum + d.raw, 0) / yearPoints;

  return data.map((d) => {
    let yearMean = m1;
    if (d.year === 2) yearMean = m2;
    if (d.year === 3) yearMean = m3;

    return {
      ...d,
      corrected: d.raw - yearMean + referenceMean,
    };
  });
}

function YearLabels() {
  return (
    <div className="pointer-events-none absolute top-2 right-[10px] left-[40px] z-10 flex px-1 font-['JetBrains_Mono'] text-[10px] font-bold tracking-wider text-slate-400">
      <div className="flex-1 text-center">YEAR 1</div>
      <div className="flex-1 border-l border-slate-200/50 text-center">YEAR 2</div>
      <div className="flex-1 border-l border-slate-200/50 text-center">YEAR 3</div>
    </div>
  );
}

export function BaselineChart() {
  const data = useMemo(() => generateData(), []);

  return (
    <div className="mt-8 mb-6 flex w-full flex-col gap-6">
      <div className="relative flex flex-col gap-2">
        <h3 className="font-['JetBrains_Mono'] text-[13px] font-semibold tracking-wide text-slate-700">
          BEFORE CORRECTION (RAW WATER LEVEL)
        </h3>
        <div className="relative h-[280px] w-full rounded-xl border border-slate-200 bg-white p-4 pt-8 shadow-sm">
          <YearLabels />
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, bottom: 5, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />
              <XAxis
                dataKey="day"
                hide
              />
              <YAxis
                domain={[0, 15]}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
              />

              <ReferenceLine
                x={364}
                stroke="#CBD5E1"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <ReferenceLine
                x={729}
                stroke="#CBD5E1"
                strokeDasharray="4 4"
                strokeWidth={1}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
                labelStyle={{ display: 'none' }}
                formatter={(value: number | string | readonly (number | string)[] | undefined) => [Number(value).toFixed(2) + 'm', 'Water Level']}
              />
              <Line
                type="monotone"
                dataKey="raw"
                stroke="#818CF8"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="relative flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <h3 className="font-['JetBrains_Mono'] text-[13px] font-semibold tracking-wide text-slate-700">
            AFTER ALIGNMENT (MEAN-CORRECTED)
          </h3>
          <div className="relative z-20 rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 font-['JetBrains_Mono'] text-[11px] text-indigo-600">
            Reference Mean: 5.0m
          </div>
        </div>
        <div className="relative h-[280px] w-full rounded-xl border border-slate-200 bg-white p-4 pt-8 shadow-sm">
          <YearLabels />
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, bottom: 5, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />
              <XAxis
                dataKey="day"
                hide
              />
              <YAxis
                domain={[0, 15]}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
              />

              <ReferenceLine
                x={364}
                stroke="#CBD5E1"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <ReferenceLine
                x={729}
                stroke="#CBD5E1"
                strokeDasharray="4 4"
                strokeWidth={1}
              />

              <ReferenceLine
                y={5}
                stroke="#6366F1"
                strokeDasharray="4 4"
                strokeWidth={1}
                opacity={0.5}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
                labelStyle={{ display: 'none' }}
                formatter={(value: number | string | readonly (number | string)[] | undefined) => [Number(value).toFixed(2) + 'm', 'Water Level']}
              />
              <Line
                type="monotone"
                dataKey="corrected"
                stroke="#34D399"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
