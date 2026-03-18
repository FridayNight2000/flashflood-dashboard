import type { ReactNode } from 'react';

type SectionProps = {
  step: string;
  title: string;
  accentClass: string;
  badgeBgClass: string;
  children: ReactNode;
  last?: boolean;
};

type StatItem = {
  value: string;
  label: string;
};

type StatRowProps = {
  valueClass: string;
  items: StatItem[];
};

type ParagraphProps = {
  children: ReactNode;
};

export default function ValidationPage() {
  return (
    <div className="bg-white font-['DM_Sans']">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-275 p-2.5">
        {/* Header */}
        <header className="mb-11">
          <div className="mb-3 font-['JetBrains_Mono'] text-[11px] font-medium tracking-[0.14em] text-indigo-600 uppercase">
            Flash Flood Prediction System
          </div>
          <h1 className="m-0 text-4xl leading-[1.1] font-bold tracking-[-0.025em] text-slate-900">
            Validation
          </h1>
          <p className="mt-3.5 text-[15px] leading-[1.75] text-slate-400">
            Validation summaries and diagnostic views document how extracted events are checked and
            interpreted before downstream analysis.
          </p>
        </header>

        {/* Step 01 */}
        <Section
          step="01"
          title="Raw Data"
          accentClass="text-indigo-600"
          badgeBgClass="bg-indigo-50"
        >
          <P>
            The source data comes from water level observation records maintained by Japan's
            Ministry of Land, Infrastructure, Transport and Tourism (MLIT). These records cover
            2,106 river monitoring stations distributed across the country, each providing
            continuous water level time series spanning multiple decades.
          </P>
          <P>
            Rather than relying on pre-labeled flood event records, this project works directly from
            raw station observations — making the quality and continuity of the underlying time
            series the critical starting condition for everything that follows.
          </P>
          <StatRow
            valueClass="text-indigo-600"
            items={[
              { value: '2,106', label: 'Stations' },
              { value: 'MLIT', label: 'Source' },
              { value: '20+', label: 'Years span' },
            ]}
          />
        </Section>

        {/* Step 02 */}
        <Section
          step="02"
          title="Data Cleaning"
          accentClass="text-amber-600"
          badgeBgClass="bg-amber-50"
        >
          <P>
            Raw station records contain noise that makes them unsuitable for direct use:
            unregistered sensor readings, unmeasured placeholder values, and inconsistent
            text-formatted entries. These are identified and removed before any further processing.
          </P>
          <P>
            In parallel, all source files are converted from their original text format into
            structured CSV, significantly improving processing efficiency. Stations are then
            filtered by temporal coverage — only those with continuous records within the 2002–2023
            window are retained.
          </P>
          <div className="mt-5 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3.5 font-['JetBrains_Mono'] text-xs leading-8 text-amber-800">
            <span className="font-semibold text-amber-600">filter</span>
            {'  ← remove unregistered / unmeasured values'}
            <br />
            <span className="font-semibold text-amber-600">convert</span>
            {'  ← text → structured CSV'}
            <br />
            <span className="font-semibold text-amber-600">retain</span>
            {'  ← continuous records within 2002–2023'}
          </div>
        </Section>

        {/* Step 03 */}
        <Section
          step="03"
          title="Prepared Dataset"
          accentClass="text-emerald-600"
          badgeBgClass="bg-emerald-50"
          last
        >
          <P>
            After cleaning and coverage filtering, 1,922 stations remain — each with a verified,
            continuous water level record spanning 2002 to 2023. The number of active stations per
            year stays consistently above 1,750, confirming stable nationwide coverage.
          </P>
          <P>
            This dataset forms the direct input to the extraction stage: clean, consistently
            formatted time series ready for flash flood event identification.
          </P>
          <StatRow
            valueClass="text-emerald-600"
            items={[
              { value: '1,922', label: 'Stations retained' },
              { value: '91.3%', label: 'Retention rate' },
              { value: '1,750+', label: 'Min yearly active' },
            ]}
          />
        </Section>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function Section({ step, title, accentClass, badgeBgClass, children, last = false }: SectionProps) {
  return (
    <section className={`border-t border-slate-100 pt-8 ${last ? 'pb-0' : 'pb-8'}`}>
      {/* Merged step + title row */}
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-['JetBrains_Mono'] text-xs font-bold ${badgeBgClass} ${accentClass}`}
        >
          {step}
        </span>
        <h2 className="m-0 text-xl font-bold tracking-[-0.015em] text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function P({ children }: ParagraphProps) {
  return <p className="mb-2.5 text-[14.5px] leading-[1.8] text-slate-500">{children}</p>;
}

function StatRow({ valueClass, items }: StatRowProps) {
  return (
    <div className="mt-5 flex gap-7 rounded-lg border border-slate-100 bg-slate-50 px-5 py-4">
      {items.map((s) => (
        <div key={s.label}>
          <div className={`font-['JetBrains_Mono'] text-lg font-bold ${valueClass}`}>{s.value}</div>
          <div className="mt-0.5 text-[10.5px] tracking-[0.05em] text-slate-400">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
