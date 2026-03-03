import React from 'react';

export default function IntroPage() {
  return (
    <div className="ml-auto mr-6 max-w-5xl space-y-6">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Introduction</h1>

      {/* Section 1: Background & Motivation */}
      <section className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Background & Motivation
        </h2>
        <p className="text-lg leading-7 text-slate-600">
          Flash Floods, as an extreme variant of flooding, are most significantly characterized by a
          rapid rise in water level (typically peaking within 6 hours) and possessing destructive
          power far exceeding conventional floods. Given Japan&apos;s unique topography and hydrological
          characteristics, flash flood events are highly frequent in the region. However, although
          existing early warning systems can handle conventional floods, specialized early warnings
          for &quot;flash floods&quot;—a sudden disaster—are still absent in Japan. To promote future disaster
          prevention research and prediction work, building a detailed and reliable historical flash
          flood event database for all of Japan is an indispensable cornerstone.
        </p>
      </section>

      {/* Section 2: Project Scope & Objectives */}
      <section className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Project Positioning and Goals
        </h2>
        <p className="text-lg leading-7 text-slate-600">
          This document focuses on the automated data extraction pipeline for the Japan-wide Flash
          Flood Event Database. To overcome the bottleneck of inefficiency in manual processing
          (e.g., via Excel) when facing massive hydrological data, this project developed a core
          processing library based on Python. The pipeline is responsible for the entire calculation
          process from raw data cleaning and event boundary determination to complex hydrological
          feature extraction, aiming to produce a high-confidence structured flash flood database
          and ultimately provide core data support for a UI project that supports database querying
          and downloading.
        </p>
      </section>

      {/* Section 3: Scale & Feasibility */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Research Scale and Data Feasibility
        </h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-1 font-semibold text-slate-800">Data Depth and Breadth</h3>
            <p className="text-lg leading-7 text-slate-600">
              Japan has an extensive and well-documented network of hydrological stations. This
              study excluded stations with severe data missingness, locking onto 1,922 target
              stations that possessed stable and valid water level data and official comparison
              records between 2002 and 2023.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-1 font-semibold text-slate-800">Massive Sample Accumulation</h3>
            <p className="text-lg leading-7 text-slate-600">
              Limiting the study to a single region results in too few valid event samples. Based on
              1,922 target stations nationwide, this pipeline successfully extracted a massive number
              of flash flood event samples, providing an ample data reserve for various future
              hydrological analyses and large-scale computational needs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
