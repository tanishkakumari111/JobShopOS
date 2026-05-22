# JobShop OS Stitch Design Notes

## Overview
The Stitch export defines the visual reference for JobShop OS Phase 1.
The system is intentionally industrial, dense, and operational rather than playful or marketing-led.

## Core Design Language
- Slate / navy-based shell with light surfaces for content panels.
- Dense information layout optimized for manufacturing operations.
- Compact cards, tables, and timelines with strong borders and minimal shadow.
- High-signal status colors for operational states.
- Monospace treatment for IDs, job numbers, quote numbers, and part numbers.
- Clear separation between internal views and customer-safe views.

## Typography
- Functional UI typography uses `Inter`.
- Technical identifiers use `JetBrains Mono`.
- Headings are compact and semibold.
- Body text stays readable at small sizes.

## Shape and Spacing
- Small radii.
- Tight vertical rhythm.
- Practical, desktop-first grid.
- Tablet and mobile collapse to a single-column or simplified shell, but keep readable touch targets.

## Color Logic
- Navy / slate for primary shell chrome.
- Emerald for approved, complete, or available states.
- Amber for warning, pending, or at-risk states.
- Rose for failed, blocked, or critical states.
- Indigo / blue for active production or neutral operational signal.

## Components Observed in the Export
- Production dashboard with operational metrics and alerts.
- Capacity planner with work-center load and bottleneck signals.
- Job detail views with linked IDs and status history.
- Work order traveler / printable job routing output.
- Quality dashboard with inspection and exception states.
- Materials dashboard with availability, reservation, and shortage cues.
- Quotes dashboard with approval and conversion flow.
- Audit trail / traceability view with event chronology.

## Phase 1 Use
Use the Stitch export as a visual reference for:
- shell density
- table rhythm
- badge styling
- ID link styling
- alert severity presentation
- customer-safe vs internal surfaces

The app should feel like a serious manufacturing operations tool, not a generic admin dashboard.
