# Spray Wall Tracker

A web app for tracking climbing problems on a home spray wall. Upload a photo of your wall, draw holds to create problems, and log your sends.

Built by [Michael Guard](https://github.com/michael-guard).

**Live app:** [spraywall.org](https://spraywall.org)

<!-- TODO: Add screenshots here -->

## What Is a Spray Wall?

A spray wall is a home climbing training wall covered in holds with no predefined routes. Climbers create their own problems (routes) by choosing which holds to use. This app lets you digitally track those problems so you don't have to remember them all.

## Features

- **Wall photo management** — Upload a photo of your spray wall. The app stores the full-resolution image so you can pinch-to-zoom into dense hold sections.
- **Problem creation** — Draw holds directly on your wall photo using a 4-step wizard:
  1. Trace hold outlines with your finger (freehand polygon drawing)
  2. Tap to mark start holds
  3. Tap to mark finish holds
  4. Add a name, grade (V0–V10), tags, and other metadata
- **Problem list** — Browse all your problems with search, grade filtering, and sorting (newest, oldest, best rated, most/least repeats)
- **Send logging** — Track every time you send (complete) a problem. Problems automatically move from "project" to "active" after your first send.
- **Bookmarks** — Save/star problems to find them quickly later
- **Projects filter** — Filter to see only your unsent projects
- **Archiving** — Archive problems you no longer want to see in your main list

## Limitations

- **Single user** — There are no user accounts. One instance of the app = one person's problems. If multiple people need to track problems on the same wall, each person would need their own deployment.
- **Online only** — The app requires an internet connection. There is no offline mode.
- **One active wall photo** — Only one wall photo can be active at a time. If you re-set your wall, upload a new photo and it becomes the active one. Old problems still reference their original photo.
- **Mobile-first** — Designed for phones in portrait orientation. It works on desktop but the drawing experience is optimized for touch.
- **Grades are V-scale only** — V0 through V10. No Font scale or other grading systems.

## Tech Stack

- **Frontend:** React + TypeScript, built with Vite
- **Styling:** Tailwind CSS
- **Database & storage:** Supabase (Postgres + file storage)
- **Hosting:** Vercel
- **PWA:** Installable as an app on Android via Chrome

---

## Setup Guide

This section walks you through setting up your own instance of the app. You don't need to be a developer, but you'll need to be comfortable following step-by-step instructions and copying/pasting a few things.

### What You'll Need

- A [GitHub](https://github.com) account (free)
- A [Supabase](https://supabase.com) account (free tier works fine)
- A [Vercel](https://vercel.com) account (free tier works fine)
- [Node.js](https://nodejs.org) installed on your computer (download the LTS version)

### Step 1: Copy This Repository

1. Click the green **Code** button at the top of this page
2. Click **Use this template** > **Create a new repository** (or fork the repo)
3. Give it a name and click **Create repository**
4. Clone your new repository to your computer:
   ```bash
   git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   cd YOUR-REPO-NAME
   ```

### Step 2: Set Up Supabase (Your Database)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a name and set a database password (save this somewhere safe)
3. Once your project is ready, go to **SQL Editor** in the left sidebar
4. Click **New query**
5. Open the file `supabase-setup.sql` from this repo, copy its entire contents, and paste it into the SQL editor
6. Click **Run** — this creates all the tables and storage the app needs
7. Go to **Settings** > **API** in the left sidebar
8. Copy your **Project URL** and **anon public key** — you'll need these next

### Step 3: Configure Environment Variables

1. In your project folder, copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 4: Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. You should see the app running.

### Step 5: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **Add New** > **Project**
3. Import your repository from GitHub
4. Before deploying, add your environment variables:
   - Click **Environment Variables**
   - Add `VITE_SUPABASE_URL` with your Supabase project URL
   - Add `VITE_SUPABASE_ANON_KEY` with your Supabase anon key
5. Click **Deploy**

Your app will be live at `your-project-name.vercel.app`. Every time you push to GitHub, Vercel will automatically redeploy.

### Step 6 (Optional): Password-Protect Your App

The app includes built-in password protection so only you can access your deployment. To enable it:

1. In your Vercel project, go to **Settings** > **Environment Variables**
2. Add two variables:
   - `BASIC_AUTH_USER` — choose a username
   - `BASIC_AUTH_PASSWORD` — choose a password
3. Redeploy (go to **Deployments**, click the three dots on the latest deployment, and click **Redeploy**)

Now when anyone visits your app, they'll be prompted for a username and password. This is optional — if you don't set these variables, the app will be open to anyone with the link.

To **disable** password protection, remove the `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD` environment variables from Vercel and redeploy.

---

## How It Works

1. **Upload a wall photo** — Take a photo of your spray wall and upload it through the app. This becomes your active wall.
2. **Create problems** — Tap the + button, then trace around holds with your finger to draw them. Mark which holds are starts and finishes, then give the problem a name and grade.
3. **Browse and climb** — Find problems from your list. Open one to see the holds highlighted on your wall photo. Pinch to zoom in on dense sections.
4. **Log sends** — After you complete a problem, log it as a send. The app tracks how many times you've sent each problem.
5. **Organize** — Star your favorites, filter by grade range, focus on projects you haven't sent yet, or archive old problems.

## License

[MIT](LICENSE) — free to use, modify, and distribute.
