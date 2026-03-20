import type { Metadata } from 'next';
import Image from 'next/image';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Validation',
};

type SectionProps = {
  title: string;
  children: ReactNode;
  last?: boolean;
};

type ParagraphProps = {
  children: ReactNode;
};

export default function ValidationPage() {
  return (
    <div className="bg-white font-[family:var(--font-doc-sans)]">
      <div className="max-w-275 p-2.5">
        {/* Header */}
        <header className="mb-11">
          <div className="mb-3 text-[11px] font-[family:var(--font-doc-mono)] font-medium tracking-[0.14em] text-indigo-600 uppercase">
            Flash Flood Prediction System
          </div>
          <h1 className="m-0 text-4xl leading-[1.1] font-bold tracking-[-0.025em] text-slate-900">
            Validation
          </h1>
          <p className="mt-3.5 text-[15px] leading-[1.75] text-slate-400">
            To verify extraction quality, I designed a metric that compares extracted events against
            official records — then measured how well the final algorithm performed.
          </p>
        </header>

        <Section title="Two Databases">
          <figure className="group mx-auto mb-5 w-full max-w-4xl overflow-hidden rounded-xl border-0 bg-white p-3">
            <Image
              src="/twodatabase.png"
              alt="Comparison of the two databases used for validation"
              width={1200}
              height={560}
              className="h-auto w-full origin-center transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </figure>
          <P>
            For each of the 1,922 stations, two independent databases exist in parallel. The
            Extracted Flood Events Database is produced by the algorithm and records the complete
            event process — Start, Peak, and End. The Historical Flood Events Database is maintained
            by MLIT and records only Peak Time and Peak Water Level for officially documented
            floods.
          </P>
          <P>
            Both databases share Peak Time as a common anchor. This makes comparison possible: if
            the extracted Peak Time falls within the same event window as the official record, the
            event is counted as matched.
          </P>
        </Section>

        <Section title="Match Rate">
          <P>
            To quantify extraction performance, I defined Match Rate as the proportion of official
            historical flood events that were successfully captured by the algorithm. A match is
            counted when the extracted Peak Time falls within the same event window as the
            officially recorded Peak Time.
          </P>
          <figure className="group mx-auto mb-5 w-full max-w-4xl overflow-hidden rounded-xl border-0 bg-white p-3">
            <Image
              src="/Matchrate.png"
              alt="Match rate definition used for validation"
              width={1200}
              height={560}
              className="h-auto w-full origin-center transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </figure>
        </Section>

        <Section
          title="Results"
          last
        >
          <P>
            Applied across all 1,922 stations and the full 2002–2023 record, the final extraction
            algorithm achieved a mean match rate of 92.57% and a median of 94.64% — confirming that
            the method reliably captures the vast majority of officially documented flood events
            nationwide.
          </P>
          <figure className="group mx-auto mt-5 w-full max-w-4xl overflow-hidden rounded-xl border-0 bg-white p-3">
            <Image
              src="/result.png"
              alt="Validation results across all stations"
              width={1200}
              height={560}
              className="h-auto w-full origin-center transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </figure>
        </Section>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function Section({ title, children, last = false }: SectionProps) {
  return (
    <section className={`border-t border-slate-100 pt-8 ${last ? 'pb-0' : 'pb-8'}`}>
      <div className="mb-4">
        <h2 className="m-0 text-xl font-bold tracking-[-0.015em] text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function P({ children }: ParagraphProps) {
  return <p className="mb-2.5 text-[14.5px] leading-[1.8] text-slate-500">{children}</p>;
}
