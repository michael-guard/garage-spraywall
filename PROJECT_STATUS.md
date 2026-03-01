# Project Status

> **Read this first** before starting any work. It tells you exactly where the project is and what to do next.

## Completed Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project Scaffold + Supabase + Deploy | Done |
| 2 | Wall Photo Upload + Display | Done |
| 3 | Hold Annotation Canvas (freeform drawing) | Done |
| 4 | Problem Creation Wizard (4-step wizard) | Done, iterating |

## Current Work: Phase 4 — Wizard Polish

Four fixes identified from phone testing. None have been implemented yet.

### 1. Tick marks should connect to the hold's stroke
The start hold tick marks float disconnected below the shape. They should visually touch/intersect the hold's outline.
- **File:** `src/components/HoldShape.tsx` — `renderTickMarks` function
- **Fix:** Remove or reduce the `gap` offset so ticks start at the shape's bottom edge instead of below it

### 2. Remove move count field
Drop the move count input from the UI entirely. The DB column stays but we hardcode `null`.
- **Files:**
  - `src/components/MetadataForm.tsx` — remove input + props (`moveCount`, `onMoveCountChange`)
  - `src/pages/CreateProblemPage.tsx` — remove `moveCount` state and prop passing
  - `src/lib/problems.ts` — remove `moveCount` from `CreateProblemInput`, hardcode `move_count: null` in the insert

### 3. Style Tags label should say "optional"
- **File:** `src/components/MetadataForm.tsx`
- **Fix:** Change `"Style Tags"` → `"Style Tags (optional)"`

### 4. Star rating buttons shouldn't grow on tap
The star buttons get bigger when tapped (default touch feedback or font-size issue).
- **File:** `src/components/MetadataForm.tsx`
- **Fix:** Add fixed dimensions (`w-10 h-10`) to star buttons to prevent resize on tap

## Up Next: Phase 5 — Problem List + Filters

After the wizard polish is done, the next phase turns the home screen into a scrollable, searchable, filterable problem list. See the PRD (Section 5.1, 5.2) and the detailed plan in `.claude/plans/unified-inventing-iverson.md` for full specs.

## Key References

- **PRD:** `prd-spray-wall-app.md` — full product requirements
- **Conventions:** `CLAUDE.md` — coding standards and architecture rules
- **Detailed plan:** `.claude/plans/unified-inventing-iverson.md` — implementation details for all phases
