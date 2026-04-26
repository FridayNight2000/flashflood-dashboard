# Flash-Flood Database Web

<p>
	<img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
	<img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
	<img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
	<img src="https://img.shields.io/badge/PostgreSQL-blue?logo=postgresql&logoColor=white" alt="PostgreSQL" />
	<img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

Flash-Flood Database Web is a research-oriented web application for exploring
flash-flood events from Japanese hydrological monitoring stations.

The project focuses on transforming station records into an event-centric
view so users can inspect spatial patterns, compare basins, and understand the
characteristics of peak events across time.

## Project Purpose

This application was built to support nationwide flash-flood analysis with a
single, unified interface.

Instead of treating each station record as an isolated source, the system
organizes data into reusable event-level information that can be browsed,
filtered, and compared consistently.

## What The Project Contains

- Interactive database map for station and basin exploration
- Event-focused side-panel analysis with visual summaries
- Browser-side data-preparation workflow for hydrological preprocessing
- Research documentation pages covering methodology and validation

## Core User Experience

Users explore flood behavior through a map-first workflow:

- Search by basin or station
- Open basin-level or station-level event analysis
- Filter by peak-date range
- View event timeline and seasonal/peak-pattern charts
- Export analysis results for external use

## System Overview

The web app is part of a broader data pipeline:

1. Source event files are prepared from research datasets.
2. Structured station/event data is stored in PostgreSQL.
3. Next.js API routes provide query access to stations and events.
4. The React client renders map interactions, panel analytics, and charts.

## Application Areas

The application is organized into three major areas:

- Database: map-based event exploration and analytics
- Prep: step-by-step preprocessing workflow
- Doc: project documentation and research narrative

## Data Scope

The project operates on station metadata and station event records, including
location, basin membership, event timing, and event magnitude indicators
(peak/rise/fall related values).

## Current Status

- The web application is active and structured for interactive exploration.
- The developer-guide documentation section is still in progress.
- No automated test suite is currently configured in this repository.

## Context

This project is developed for the Kinouchi Laboratory research effort on
flash-flood analysis in Japan.
