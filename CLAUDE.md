# Spray Wall Tracker — Project Conventions

## Stack
- **Framework:** React + TypeScript (Vite)
- **Styling:** Tailwind CSS — no separate CSS files
- **Database:** Supabase (Postgres + Storage) — no localStorage
- **Deployment:** Vercel
- **Platform:** PWA targeting Chrome on Android, portrait only

## Architecture Rules
- Single user, no auth — no user accounts, no login
- React hooks for state management — no Redux, Zustand, or other state libraries
- Supabase JS client for all data access — no backend API layer
- Online-only — no offline support or service worker caching (SW exists only for PWA install)

## Data Model
- Wall photos stored once in Supabase Storage. Problems reference `wall_photo_id` + a JSONB array of percentage-based hold coordinates. One image file serves many problems.
- Hold coordinates (`x`, `y`, `radius`) are stored as percentages (0-100) of image dimensions for resolution independence
- SVG overlay renders hold circles on top of the referenced wall photo

## Wall Photos
- Upload raw full-resolution photos directly to Supabase Storage — no client-side compression or resizing
- Photo quality is critical for pinch-to-zoom into dense spray walls
- Photos are portrait orientation only
- ~monthly upload frequency, Supabase free tier (1GB) is sufficient

## Development Approach
- Keep it minimal — avoid over-engineering
- Add routes only when the corresponding pages are built
- Simple error handling: try/catch with toast on Supabase failures, error state UI with retry
- No premature optimization

## Current Status
The app is complete and deployed. All planned phases are done. Now in iteration mode — small UX tweaks and polish as needed.

### What's built
- **Home page** — problem list with search, filter/sort (grade range, projects only, saved only), bottom bar
- **Create Problem wizard** — 4-step flow: draw holds → select starts → select finishes → metadata (name, grade, tags, feet rules, start type, status, rating)
- **Problem Detail page** — name, grade, info chips, wall photo with dark overlay + hold outlines (pinch-to-zoom), bookmark toggle, log send, archive
- **Wall photo management** — upload/activate photos in Supabase Storage
- **Canvas system** — SVG overlay with freehand polygon drawing, select gestures, pinch-to-zoom, dark overlay masking (45% opacity), color-coded holds (white=hand, blue=foot, black=finish), tick marks for starts
- **Data layer** — Supabase: problems table (JSONB holds), sends table, wall_photos table, percentage-based coordinates
- **Viewport fixes** — both detail and create pages locked to viewport height (h-dvh flex layout), no unwanted scrolling
- **Create flow toolbar redesign** — consolidated single-row toolbar: feet rules cycling toggle (SELECTED → FOLLOW → OPEN), undo, hand/foot toggle (no dot, color-only), redo. Wall photo vertically centered in canvas area.
- **Phase 7 polish** — loading skeletons (Skeleton component), ErrorBoundary with retry, fetch error state UI on all pages, useModalA11y hook (Escape + focus trap), semantic landmarks (main/nav), ARIA labels + aria-pressed on all buttons, better alt text, toast ariaProps
- **Typography** — Noto Sans via Google Fonts
