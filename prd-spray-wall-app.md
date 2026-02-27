# Spray Wall Tracker — Product Requirements Document

**Author:** Michael (with Claude)
**Date:** February 25, 2026
**Status:** Draft

---

## 1. Overview

A personal spray wall tracking app for creating, annotating, and logging boulder problems on a home climbing wall. The app replaces a manual workflow of photographing the wall and using Google Photos markup to circle holds and track problems.

**Primary user:** Single user (Michael). No multi-user support required for MVP. The app should be usable by a guest looking at the phone, but there is no concept of user accounts or authentication.

---

## 2. Technical Architecture

### Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React + TypeScript | Claude Code generates highest quality output with React; TypeScript improves AI code consistency and catches bugs at build time |
| Styling | Tailwind CSS | Claude Code reliably produces Tailwind classes; no separate CSS files needed |
| Build tool | Vite | Minimal config, fast hot reload, no SSR needed (only 4 screens) |
| Database | Supabase (Postgres) | Free tier, real database, image storage via Supabase Storage, JS client with direct DB access — no backend code required |
| Deployment | Vercel | Free, instant deployment, good PWA support |
| Platform | Progressive Web App (PWA) | Installed to home screen via Chrome on Android; full standalone window, native-feeling experience |

### Why PWA over Native

- User is on **Android + Chrome**, which is the best PWA runtime available — Google has invested heavily in PWA support
- Chrome "Add to Home Screen" creates an app-drawer icon with splash screen, indistinguishable from native
- Touch handling and pinch-to-zoom are reliable on Chrome (iOS/Safari is where PWA pain points live)
- Camera is not needed in-app — wall photos are taken externally and uploaded
- Fastest iteration loop for vibe coding: save → browser refreshes
- Can also be used on laptop if desired

### Why Supabase over localStorage

- Wall photos and problem data represent real investment of effort — one cleared browser cache would wipe everything
- Supabase free tier provides Postgres + image storage with ~10 minutes of setup
- JS client library means no API endpoints to write

---

## 3. Data Model

### 3.1 `wall_photos`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| image_url | text | Supabase Storage URL |
| uploaded_at | timestamp | |
| is_active | boolean | Most recent photo = true; all others = false |

When a new photo is uploaded, it becomes the active photo. Old photos are retained so old problems display correctly against their original image.

### 3.2 `problems`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| wall_photo_id | uuid | FK → wall_photos. Problem is permanently tied to the photo it was created on |
| name | text | Searchable |
| grade | text | V0 through V10 |
| move_count | integer | Optional |
| holds | jsonb | Array of `{x: number, y: number, radius: number, type: string}` where type is one of: `hand`, `foot_only`, `start_hand`, `start_foot`, `finish` |
| feet_rules | text | One of: `selected_feet_only` (default), `feet_follow_hands`, `open_feet` |
| start_type | text | `sit` or `stand` |
| status | text | `project`, `active`, `archived` |
| rating | integer | 1–3 stars, nullable (null until rated) |
| is_saved | boolean | Bookmark flag, default false |
| tags | jsonb | Array of strings from predefined list |
| created_at | timestamp | Set on creation, never updated |
| updated_at | timestamp | Updated on any edit |

**Hold coordinate system:** `x` and `y` are stored as percentages (0–100) of the image dimensions to ensure resolution independence. `radius` is also stored as a percentage of image width.

**Hold types and their visual indicators:**

| Type | Circle color | Additional indicator |
|------|-------------|---------------------|
| `hand` | White | — |
| `foot_only` | Blue | — |
| `start_hand` | White | Two tick marks below circle (one tick if two start holds) |
| `start_foot` | Blue | Two tick marks below circle |
| `finish` | Black | — |

**Predefined tags:** Compression, Crimpy, Cut Feet, Dead Point, Dyno, Juggy, Layback, Lock Off, Pinchy, Pocket, Powerful, Pumpy, Reachy, Slopey, Technical, Undercling

### 3.3 `sends`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| problem_id | uuid | FK → problems |
| sent_at | timestamp | |

Minimal table — just records that a send happened on a date. Total send count for a problem is derived by counting rows.

---

## 4. Problem Lifecycle

```
CREATE → project (tentative grade, unsent)
           ↓ first send
         active (confirmed grade, in rotation)
           ↓ manual action
         archived (hidden from default view, still accessible)
```

- New problems default to **project** status
- On first send, status transitions to **active** (can also be done manually)
- Grade is considered tentative while in project status
- Archiving is the only "deletion" — no hard deletes
- All fields including holds are editable at any time; `created_at` is preserved on edits

---

## 5. Screens & Flows

### 5.1 Home Screen — Problem List

**Layout:**
- Problem list takes up the full screen
- Each row displays: problem name, status badge (project), grade (V-scale), star rating (if set), send count, tags
- Tapping a row navigates to the problem detail view

**Bottom bar (all controls here for one-handed use):**
- Search input (searches by problem name)
- Filter/sort button (opens slide-up panel)
- Saved quick-filter toggle icon
- Upload new board photo button (center, less prominent)
- Create problem "+" button

**Default view:** Shows problems with status `project` or `active`. Archived problems are hidden unless explicitly filtered for.

### 5.2 Filter/Sort Panel (slide-up)

**Contents:**
- **Result count** — live count of problems matching current filter criteria, displayed at top
- **Difficulty** — min/max range selector, V0 through V10
- **Projects toggle** — when on, shows only problems with `project` status that match other criteria
- **Saved toggle** — when on, shows only saved/bookmarked problems that match other criteria
- **Sort** — options: Best (highest rating), Newest, Oldest, Most Repeats, Least Repeats

### 5.3 Problem Detail View

**Top bar:** Back arrow (returns to list), problem name, three-dot menu (edit problem via 4-step wizard with pre-populated data, archive problem)

**Main area:** Wall photo with hold markers displayed, pinch-to-zoom enabled. Below the image: grade, star rating, send count, status, feet rules, tags, start type.

**Action buttons:** Checkmark button (log send), save/bookmark icon (filled when saved)

**Send logging flow:**
1. Tap checkmark
2. Confirmation screen appears showing: V-grade (pre-filled, editable), star rating (pre-filled if set, editable), Confirm button (always enabled — no fields are required to change)
3. Tap confirm → send is logged, toast notification, status auto-transitions from project → active on first send
4. User taps back to return to problem list

### 5.4 Problem Creation — 4-Step Wizard

**Step 1: Select holds**
- Current wall photo displayed full-screen with a darkened overlay
- Photo is pannable and pinch-to-zoomable
- Feet rules selector at bottom: Selected Feet Only (default), Feet Follow Hands, Open Feet
- Tap on photo → places white circle (hand hold) at tap location with adjustable radius
- Double-tap on existing white circle → converts to blue circle (foot only)
- Tap on existing circle → deselects/removes it
- Each circle is resizable (drag handle or pinch gesture on the circle)
- Selected holds appear "lit up" against the darkened photo
- **Nav:** X (top-left, exits creation flow), Next (top-right)

**Step 2: Select start hold(s)**
- Same photo view with all placed holds visible
- Only white (hand) holds are selectable as starts
- Tapping a white hold marks it as a start hold — adds tick marks below the circle (start hands only, not start feet)
  - One start hold → two tick marks
  - Two start holds → one tick mark each
- Tapping a start hold again removes the start designation
- **Nav:** Back arrow (top-left), Next (top-right)

**Step 3: Select finish hold(s)**
- Same photo view with all placed holds visible
- Only white (hand) holds are selectable as finish
- Tapping a white hold marks it as a finish — circle changes from white to black
- Can be one or two holds
- Tapping a finish hold again removes the finish designation
- **Nav:** Back arrow (top-left), Next (top-right)

**Step 4: Metadata**
- Name (text input)
- Grade picker (V0–V10, horizontal scroll)
- Move count (optional number input)
- Style tags (predefined chip selection, multi-select)
- Start type (sit / stand toggle)
- Status: Project (default) or Sent toggle
  - If Sent is toggled, star rating selector (1-3) is shown
- **Nav:** Back arrow (top-left), Publish (top-right)

### 5.5 Wall Management

- Accessible from the home screen bottom bar
- List of wall photo versions with upload dates
- Most recent = active (used for new problem creation)
- Upload button opens device file picker to select a pre-edited photo
- All photos are portrait orientation
- Old photos are retained; old problems always display against their original photo

---

## 6. Wall Photo Versioning

**Philosophy:** Each wall photo is an atomic snapshot. Problems are permanently tied to the photo they were created on.

- When holds are added to the physical wall, the user takes a new photo (externally, using the Android camera + Google Photos for lighting adjustments), then uploads it as a new wall version
- New problems are always created against the latest (active) photo
- Old problems remain viewable with their original photo — no remapping needed
- There is no global hold map — each problem stores its own set of hold coordinates relative to its wall photo

This approach was chosen because:
- The user adds holds roughly monthly, which would invalidate coordinate mappings if photos are taken from slightly different angles
- Re-mapping all holds on every photo update is unacceptable friction
- A global hold map provides minimal value for a single user (no shared hold references, no heatmaps needed)

---

## 7. Hold Annotation Interaction

**Placement:** Tapping on the wall photo places a colored circle at the touch coordinates. The circle is rendered as an SVG or canvas overlay on the image element.

**Sizing:** Each circle has an adjustable radius. After placement, the user can resize by dragging a handle or pinch gesture on the circle. This accommodates the range of hold sizes on a spray wall — from small crimps to large volumes.

**Coordinate storage:** `x` and `y` are stored as percentages of image dimensions (0–100). `radius` is stored as a percentage of image width. This ensures holds render correctly regardless of screen size or zoom level.

**Visual treatment:** During problem creation, the wall photo is displayed with a darkened overlay. Selected holds appear as bright colored circles against the dark background, making selections clearly visible.

**Gesture summary (Step 1):**

Note: Browser default double-tap-to-zoom must be suppressed on the photo canvas so double-tap is exclusively used for hold type conversion.

| Gesture | Action |
|---------|--------|
| Tap (empty area) | Place white (hand) circle |
| Double-tap (white circle) | Convert to blue (foot only) circle |
| Tap (existing circle) | Remove/deselect |
| Pinch on photo | Zoom in/out |
| Drag on photo | Pan |
| Drag circle edge | Resize radius |

---

## 7b. Error Handling

The app assumes a wireless network connection is available. No offline support or service worker caching is needed for MVP. If a network request fails (dropped signal, Supabase timeout), display an error toast/card so the user knows the action failed and can retry. No silent failures.

---

1. **Circle resize gesture:** Needs prototyping. Drag-handle and pinch-to-resize on individual circles both have tradeoffs (pinch conflicts with photo zoom). Build both and test — may need a "resize mode" toggle or long-press to enter resize on a specific circle. **Decision: Prototype and iterate.**

2. **Double-tap conflict:** Stōkt disables the default double-tap-to-zoom on their photo canvas. We should do the same — suppress the browser's default double-tap zoom within the annotation area so that double-tap is exclusively used to convert white → blue hold markers. **Decision: Disable browser double-tap zoom on the photo canvas.**

3. **Minimum tap target size:** Circles are a manual overlay — the user places them and controls their size. No snapping behavior needed. The user can pinch-to-zoom into dense areas. **Decision: Start simple, no snap-to-hold.**

4. **Start hold tick marks:** Only applies to start hand holds. Start feet do not get tick marks. No combination of start hands and start feet — sit starts are indicated by the start type field on the problem metadata, not by foot-specific markers. **Decision: Tick marks for start hands only.**

5. **Shuffle sort:** Dropped from MVP. **Decision: Removed.** Sort options are: Best (highest rating), Newest, Oldest, Most Repeats, Least Repeats.

6. **Problem editing flow:** Re-uses the same 4-step wizard with all fields pre-populated from the existing problem data. No inline edit mode for MVP. **Decision: Re-use wizard, pre-populated.**

7. **Offline support:** Not needed. Assume wireless signal is available. On network failure, display an error card/toast so the user knows the action failed. **Decision: Online-only with error handling.**

8. **Photo aspect ratio:** Wall photos will always be portrait. No need to handle landscape. **Decision: Portrait only.**

9. **Send confirmation auto-transition:** On first send, status automatically transitions from project → active. No prompt needed. Grade can be updated during the send confirmation or through the edit flow. **Decision: Auto-transition confirmed.**

10. **Tags on problem list rows:** Tags are shown on the problem list rows alongside name, status badge, grade, stars, and send count. **Decision: Include tags on list rows.**

## 8b. Remaining Open Questions

None at this time. All questions resolved — prototype and iterate on gesture conflicts (#1, #2) during development.

---

## 9. Future Considerations (Out of Scope for MVP)

- Multi-user support (friends logging sends on the wall)
- Multiple saved lists (currently just one binary saved/not-saved)
- Computer vision hold segmentation (replace adjustable circles with precise outlines)
- Session tracking (grouping sends by climbing session with date/duration)
- Send history view per problem (list of all send dates)
- Grade pyramid visualization
- Video linking (attach video of attempts to problems)
- Data export
- Offline-first with sync
