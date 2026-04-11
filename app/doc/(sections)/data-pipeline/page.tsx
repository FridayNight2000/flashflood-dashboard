import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Data Pipeline',
};

type SectionProps = {
  title: string;
  children: ReactNode;
  last?: boolean;
  titleHref?: string;
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

export default function DataPipelinePage() {
  return (
    <div className="bg-white font-sans">
      <div className="max-w-275 p-2.5 pr-15 pl-5">
        {/* Header */}
        <header className="mb-11">
          <div className="mb-3 text-[11px] font-mono font-medium tracking-[0.14em] text-indigo-600 uppercase">
            Flash Flood database
          </div>
          <h1 className="m-0 text-4xl leading-[1.1] font-bold tracking-[-0.025em] text-slate-900">
            Data Pipeline
          </h1>
          <p className="mt-3.5 text-[15px] leading-[1.75] text-slate-400">
            Before any event can be extracted, the underlying station data needs to be sourced,
            screened, and cleaned — producing a reliable dataset ready for downstream processing.
          </p>
        </header>

        {/* Step 01 */}
        <Section title="Raw Data">
          <P>
            The source data comes from water level observation records maintained by Japan&apos;s
            Ministry of Land, Infrastructure, Transport and Tourism (MLIT). These records cover
            2,106 river monitoring stations distributed across the country, each providing
            continuous water level time series spanning multiple decades.
          </P>
          <P>
            Rather than relying on pre-labeled flood event records, this project works directly from
            raw station observations — making the quality and continuity of the underlying time
            series the critical starting condition for everything that follows.
          </P>
          {/*
          <StatRow
            valueClass="text-indigo-600"
            items={[
              { value: '2,106', label: 'Stations' },
              { value: 'MLIT', label: 'Source' },
              { value: '20+', label: 'Years span' },
            ]}
          />
          */}
        </Section>

        {/* Step 02 */}
        <Section
          title="Data Cleaning"
          titleHref="/prep"
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
        </Section>

        {/* Step 03 */}
        <Section
          title="Prepared Dataset"
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
          {/*
          <StatRow
            valueClass="text-emerald-600"
            items={[
              { value: '1,922', label: 'Stations retained' },
              { value: '91.3%', label: 'Retention rate' },
              { value: '1,750+', label: 'Min yearly active' },
            ]}
          />
          */}
        </Section>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function Section({ title, children, last = false, titleHref }: SectionProps) {
  return (
    <section className={`border-t border-slate-100 pt-8 ${last ? 'pb-0' : 'pb-8'}`}>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="m-0 text-xl font-bold tracking-[-0.015em] text-slate-900">
          {titleHref ? (
            <Link
              href={titleHref}
              className="transition-colors hover:text-amber-600"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
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
          <div className={`text-lg font-mono font-bold ${valueClass}`}>
            {s.value}
          </div>
          <div className="mt-0.5 text-[10.5px] tracking-[0.05em] text-slate-400">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
