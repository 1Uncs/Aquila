# Task: Gold-Standard Mobile App UI/UX Redesign & Specification Alignment

## Overview
- Ground all work on local base `9e64bf9` (discarding broken AI Studio artifacts from `23de3de`).
- Deliver a comprehensive, state-of-the-art 2026/2027 Expo React Native mobile UI/UX redesign.
- Eliminate generic layouts, double paddings, margins, and nested scroll issues.
- Align all domain features with the audio specification (Parts 1-9) & PRD:
  1. Multi-tenancy Organization in Authentication
  2. Candidate Entity vs. Party Modeling & History
  3. AI Projection Engine (0: 2023, 1: 2019, 2: Combined) + Disclaimer
  4. Live Election Pulse Simulation (15-30s periodic polling)
  5. Drafts vs. Published Results Workflow (Live badge, submit, publish)
  6. Field Agent 3 Assigned Polling Units Demo
  7. Strict Live Media Capture (No gallery, covert flash/sound defaults, 2-min auto-save)
  8. Incident Triage Workflow (Reviewing / Resolved) + Category Filters
  9. Electoral Location Hierarchy Autocomplete (Qualified by parent state)
  10. Full Candidate Collation & Detail Results View

## Progress Checklist
- [x] 1. Clean working state based on `9e64bf9` and preserve brand assets
- [x] 2. Audit and enhance Theme & Tokens (`constants/colors.ts`, `constants/tokens.ts`)
- [x] 3. Audit and enhance Data Models & Stores (`features/auth/store.tsx`, `features/elections/service.ts`, `features/elections/hooks.ts`)
- [x] 4. Redesign Auth Screen with Multi-Tenancy (`app/(auth)/login.tsx`)
- [x] 5. Redesign Dashboard (`app/(app)/(tabs)/index.tsx`) with Live Pulse, AI Projection, Drafts alert, Assigned PUs, and Candidate Snapshot
- [x] 6. Redesign Results Screen & Workflows (`results.tsx`, `result-drafts.tsx`, `result-detail.tsx`, `result-submit.tsx`, `result-collation.tsx`)
- [x] 7. Redesign Incident Screen & Live Capture (`incidents.tsx`, `incident-report.tsx`, `incident-search.tsx`)
- [x] 8. Redesign Locations & Picker (`locations.tsx`, `pu-picker.tsx`)
- [x] 9. Polish Parties, Elections, Profile (`parties.tsx`, `elections.tsx`, `election-detail.tsx`, `profile.tsx`)
- [x] 10. Audit double margins/paddings, nested virtualized lists, run `npx tsc --noEmit` and verify invariants.

## Verification Status
- Staff Invariant Audit: INVARIANTS VERIFIED
- `npx tsc --noEmit`: Exited with code 0 (clean, 0 errors).
- Double padding/margin: Eliminated across all `Card` instances, `ScreenView` padding, and outer container styling.
- Virtualized list nesting: Eliminated across all `FlashList` instances by converting parents to `ScreenView scrollable={false} noScrollPadding`.
- Audio specification alignment: Fully integrated across parts 1–9.
