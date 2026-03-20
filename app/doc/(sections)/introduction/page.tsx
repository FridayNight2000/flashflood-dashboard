import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Introduction',
};

type ParagraphProps = {
  children: ReactNode;
};

export default function IntroductionPage() {
  return (
    <div className="bg-white font-[family:var(--font-doc-sans)]">
      <div className="px max-w-275 p-2.5 pr-15 pl-5">
        <header className="mb-5">
          <div className="mb-3 font-[family:var(--font-doc-mono)] text-[11px] font-medium tracking-[0.14em] text-indigo-600 uppercase">
            Flash Flood Database
          </div>
          <h1 className="m-0 text-4xl leading-[1.1] font-bold tracking-[-0.025em] text-slate-900">
            Introduction
          </h1>
          <p className="mt-3.5 text-[15px] leading-[1.75] text-slate-400">
            This document introduces the purpose of the database, the research gap it addresses, and
            the analytical work it is designed to support.
          </p>
        </header>

        <section className="border-t border-slate-100 pt-5 pb-5">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="m-0 text-xl font-bold tracking-[-0.015em] text-slate-900">
              What This Database Is
            </h2>
          </div>
          <P>
            The Japan-wide Flash Flood Database is a structured event-level database designed to
            record flash flood events across river stations in Japan.
            <br />
            Rather than storing only raw hydrological observations, it organizes flash flood events
            into reusable records that can be searched, compared, and analyzed at national scale.
          </P>
        </section>

        <section className="border-t border-slate-100 pt-5 pb-5">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="m-0 text-xl font-bold tracking-[-0.015em] text-slate-900">
              Why This Database Is Needed
            </h2>
          </div>
          <P>
            Flash flood research requires more than isolated station data or case-by-case analysis.
            Although Japan has extensive hydrological observations, these data are not directly
            organized into structured flash flood event records.
            <br />
            This makes nationwide analysis, consistent event comparison, and downstream reuse
            difficult. This database was built to address that gap by converting distributed
            observation data into a unified and reusable event-level foundation for flash flood
            research.
          </P>
        </section>

        <section className="border-t border-slate-100 pt-5 pb-0">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="m-0 text-xl font-bold tracking-[-0.015em] text-slate-900">
              What This Database Enables
            </h2>
          </div>
          <P>
            By organizing flash flood events into a structured nationwide database, this project
            supports large-scale event inspection, cross-station comparison, and data retrieval. It
            also provides a reliable foundation for downstream tasks such as validation, statistical
            analysis, and future flood prediction research.
          </P>
        </section>
      </div>
    </div>
  );
}

function P({ children }: ParagraphProps) {
  return <p className="text-[14.5px] leading-[1.8] text-slate-500">{children}</p>;
}
