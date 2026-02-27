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
- Keep it minimal — no loading skeletons, error boundaries, or accessibility polish until Phase 7
- Add routes only when the corresponding pages are built
- Simple error handling: try/catch with toast on Supabase failures
- No premature optimization
