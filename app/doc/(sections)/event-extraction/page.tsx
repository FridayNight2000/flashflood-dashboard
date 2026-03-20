import type { Metadata } from 'next';
import Image from 'next/image';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Event Extraction',
};

type ParagraphProps = {
  children: ReactNode;
};

type SectionData = {
  title: string;
  accentClass: string;
  last?: boolean;
  content: ReactNode;
};

export default function EventExtractionPage() {
  const sections: SectionData[] = [
    {
      title: 'Baseline Correction',
      accentClass: 'text-indigo-600',
      content: (
        <>
          <P>
            A station&apos;s baseline water level shifts year to year due to channel changes,
            sediment, or instrumentation drift. Applying a fixed threshold across a 20-year record
            without correcting for this produces uneven results — real peaks get missed in
            low-baseline years, false events appear in high-baseline years.
          </P>
          <P>
            Yearly Mean Alignment is applied to the full dataset before extraction begins. Each
            year&apos;s series is shifted to a common reference point, removing inter-annual offset
            while preserving within-year variation and extreme structure. Once events are identified
            on the corrected data, their timestamps are mapped back to the original series — the
            database stores real observed water levels.
          </P>
        </>
      ),
    },
    {
      title: 'Peak Detection',
      accentClass: 'text-amber-600',
      content: (
        <>
          <P>
            Real flood peaks are frequently plateau-shaped rather than sharp spikes — a standard
            peak-finding algorithm treats the flat stretch as ambiguous and skips it, causing a
            structurally significant class of events to go undetected.
          </P>
          <P>
            A plateau_size parameter resolves this: when a stretch of equal water levels is flanked
            by lower values on both sides, the left edge of that stretch is marked as the peak.
            Candidates are then filtered by the 75th percentile — only peaks exceeding P75 of the
            corrected series are retained.
          </P>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <figure className="group overflow-hidden rounded-xl border-0 bg-white p-3">
              <Image
                src="/Regular.png"
                alt="Regular peak detection result"
                width={1200}
                height={560}
                className="h-auto w-full origin-center transition-transform duration-300 ease-out group-hover:scale-105"
              />
            </figure>
            <figure className="group overflow-hidden rounded-xl border-0 bg-white p-3">
              <Image
                src="/plateau.png"
                alt="Peak detection with plateau_size enabled"
                width={1200}
                height={560}
                className="h-auto w-full origin-center transition-transform duration-300 ease-out group-hover:scale-105"
              />
            </figure>
          </div>
        </>
      ),
    },
    {
      title: 'Boundary Assignment',
      accentClass: 'text-emerald-600',
      last: true,
      content: (
        <>
          <P>
            For each confirmed peak, the series is scanned forward and backward to locate the event
            boundaries. The start is the last point before the peak where the water level crosses
            below P50; the end is the first point after the peak where it falls back below P50.
          </P>
          <P>
            This ensures every event in the database has a complete rise-and-fall structure anchored
            to a verified extreme peak.
          </P>
          <figure className="group mt-5 overflow-hidden rounded-xl border-0 bg-white p-3">
            <Image
              src="/process_defination.png"
              alt="Process definition timeline showing start, peak, and end boundaries"
              width={1200}
              height={560}
              className="h-auto w-full origin-center transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </figure>
          <div className="mt-5 grid grid-cols-1 gap-3 font-[family:var(--font-doc-mono)] text-[11px] leading-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-sky-50 px-3 py-2.5 text-sky-800">
              <div className="text-xs">
                <span className="font-semibold text-sky-600">Start: </span>
                water level crosses above P50
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 px-3 py-2.5 text-rose-800">
              <div className="text-xs">
                <span className="font-semibold text-rose-600">Peak: </span>
                highest point exceeding P75
              </div>
            </div>
            <div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-emerald-800">
              <div className="text-xs">
                <span className="font-semibold text-emerald-600">End: </span>
                water level falls back below P50
              </div>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="overflow-hidden bg-white font-[family:var(--font-doc-sans)]">
      <div className="max-w-275 p-2.5 pr-15 pl-5">
        {/* Header */}
        <header className="mb-11">
          <div className="mb-3 font-[family:var(--font-doc-mono)] text-[11px] font-medium tracking-[0.14em] text-indigo-600 uppercase">
            Flash Flood Database
          </div>
          <h1 className="m-0 text-4xl leading-[1.1] font-bold tracking-[-0.025em] text-slate-900">
            Event Extraction
          </h1>
          <p className="mt-3.5 text-[15px] leading-[1.75] text-slate-400">
            Defining what counts as a flash flood event is harder than extracting one — every design
            decision required a concrete trade-off between sensitivity, completeness, and cross-year
            consistency.
          </p>
        </header>

        {sections.map((section) => (
          <section
            key={section.title}
            className={`border-t border-slate-100 pt-8 ${section.last ? 'pb-0' : 'pb-8'}`}
          >
            <div className="mb-4 flex items-center gap-3">
              <h2 className="m-0 text-xl font-bold tracking-[-0.015em] text-slate-900">
                {section.title}
              </h2>
            </div>
            {section.content}

            {!section.last && (
              <div
                aria-hidden
                className="mt-8 flex justify-center"
              >
                <SectionConnector accentClass={section.accentClass} />
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function P({ children }: ParagraphProps) {
  return <p className="mb-2.5 text-[14.5px] leading-[1.8] text-slate-500">{children}</p>;
}

type SectionConnectorProps = {
  accentClass: string;
};

function SectionConnector({ accentClass }: SectionConnectorProps) {
  return (
    <div className={`flex flex-col items-center ${accentClass}`}>
      <div className="h-8 w-px bg-current/35" />
      <div className="-mt-px h-2.5 w-2.5 rotate-45 border-r border-b border-current" />
    </div>
  );
}
