# Life Dashboard

A personal all-in-one life tracker and analytics dashboard. Aggregates data across 13 life categories — from sleep and mood to job applications and finances — into a single local interface.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Coding Conventions](#coding-conventions)
- [UI / Design](#ui--design)
- [Content](#content)
- [Testing](#testing)
- [File & Content Rules](#file--content-rules)
- [Future Updates](#future-updates)

---

## Project Overview

Life Dashboard is a monorepo with three independent modules:

| Module | Purpose |
|---|---|
| `client/` | React + TypeScript SPA — the UI |
| `server/` | Express + TypeScript API — data layer |
| `chrome-extension/` | MV3 browser extension — passive time tracker |

**Trackers (13 total):**

| Tracker | Data source | Path |
|---|---|---|
| Home | — | `/` |
| Networking | Google Sheets | `/networking` |
| Job Applications | Google Sheets | `/job-apps` |
| Productivity | SQLite (via extension) | `/productivity` |
| Tech Learnings | Google Sheets | `/tech-learnings` |
| Finances | Google Sheets | `/finances` |
| Mood | SQLite | `/mood` |
| Food | SQLite | `/food` |
| Movement & Dance | SQLite | `/movement` |
| Habits | SQLite | `/habits` |
| Sleep | SQLite | `/sleep` |
| Student Life | Google Sheets (stub) | `/student-life` |
| Content Creation | Google Sheets | `/content-creation` |

### Getting Started

**Prerequisites:** Node.js 20+, Chrome (for extension), Google Cloud project with Sheets API enabled.

**Server:**
```bash
cd server
cp .env.example .env        # fill in GOOGLE_SHEETS_ID + paths
npm install
npm run auth:sheets         # one-time OAuth flow
npm run dev                 # starts on :3001
```

**Client:**
```bash
cd client
npm install
npm run dev                 # starts on :5173, proxies /api → :3001
```

**Chrome Extension:**
Load `chrome-extension/` as an unpacked extension in `chrome://extensions`.

---

## Tech Stack

### Frontend (`client/`)

| Tool | Version | Role |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| React Router | v7 | Client-side routing |
| Vite | 8 | Dev server + bundler |
| Tailwind CSS | v4 | Utility classes |
| Axios | 1.x | HTTP client |

### Backend (`server/`)

| Tool | Version | Role |
|---|---|---|
| Node.js + Express | 5.x | REST API server |
| TypeScript | 6 | Type safety |
| better-sqlite3 | 12.x | Local SQLite database |
| googleapis | 173.x | Google Sheets API v4 |
| dotenv | 17.x | Environment config |

### Chrome Extension (`chrome-extension/`)

- Manifest V3 service worker
- Tracks active tab domain per day
- Syncs usage data to backend every 30 seconds
- Fires browser notifications at 80% and 100% of per-site daily budgets

---

## Architecture

### Overview

```
client/          →  /api/*  →  server/
                               ├── SQLite (mood, food, sleep, movement, habits, productivity)
                               └── Google Sheets (networking, job-apps, finances, tech-learnings, content-creation)

chrome-extension/  →  POST /api/productivity  →  server/
```

### Client

```
src/
├── api/client.ts          # Axios instance (baseURL: /api)
├── App.tsx                # BrowserRouter + all 13 routes
├── components/            # Sidebar, PageHeader, SheetTable, StatCard
├── hooks/useSheetData.ts  # CRUD hook for Google Sheets endpoints
├── pages/                 # One file per tracker
└── types/index.ts         # All shared TypeScript interfaces
```

Pages that use Google Sheets call `useSheetData(endpoint)`, which returns `{ data, loading, notConfigured, reload, addRow, editRow, removeRow }`. Pages that use SQLite make direct `api.get/post/delete` calls.

### Server

```
src/
├── index.ts               # Express app, CORS, route mounts
├── config.ts              # Env vars with defaults
├── db.ts                  # SQLite init + 8 table schemas
├── routes/                # One router per tracker
│   ├── food.ts
│   ├── mood.ts
│   ├── sleep.ts
│   ├── movement.ts
│   ├── habits.ts
│   ├── productivity.ts
│   └── sheets.ts          # Generic sheetsRoute() factory for Sheets-backed trackers
├── services/
│   ├── sheets.ts          # Google Sheets API (read, append, update, delete)
│   └── obsidian.ts        # Obsidian vault reader
└── scripts/auth-sheets.ts # One-time OAuth2 setup
```

`sheetsRoute(sheetName)` in `routes/sheets.ts` creates three endpoints (`GET /`, `POST /`, `PATCH /:rowIndex`, `DELETE /:rowIndex`) for any Google Sheets tab, eliminating per-tab boilerplate.

### Database Schema

8 SQLite tables in `server/data/`:

| Table | Key columns |
|---|---|
| `mood_entries` | date, period (morning/afternoon/night), rating (1–5), music_listened |
| `food_logs` | date, meal_type (breakfast/lunch/dinner/snack), description |
| `meal_prep` | week_start (unique), plan |
| `movement_logs` | date, type (walk/exercise/dance), duration_minutes, notes |
| `movement_prompts` | date (unique), prompt |
| `habit_logs` | date, habit, completed (0/1), notes — UNIQUE(date, habit) |
| `sleep_logs` | date (unique), bedtime, wake_time, quality (1–5), notes |
| `productivity_daily` | date (unique), data_json (JSON blob) |

---

## Coding Conventions

### General

- TypeScript strict mode throughout — no `any` unless unavoidable
- No comments unless the *why* is non-obvious (not the what)
- Prefer small, focused files over large ones
- No unused variables, imports, or dead code

### Frontend

- One page component per tracker, colocated in `src/pages/`
- Shared UI primitives (StatCard, PageHeader, SheetTable) in `src/components/` — reuse before creating new ones
- All domain types in `src/types/index.ts`; no inline type definitions in components
- Inline styles via CSS variables for theme values (`var(--accent)`); Tailwind for layout and spacing
- Avoid mixing inline styles and Tailwind on the same element unless necessary
- `useSheetData` for all Google Sheets pages; direct `api.*` calls for SQLite pages
- State: `useState` + `useEffect` — no external state library

### Backend

- Each route file exports a single Express `Router`
- Mounted in `index.ts` under `/api/<tracker-name>`
- Use `better-sqlite3` synchronously — no `async/await` for DB calls
- Google Sheets calls are async; wrap in try/catch and return appropriate status codes
- `config.ts` is the single source for all env vars — never `process.env.*` directly in routes

### Chrome Extension

- Pure vanilla JS (no bundler)
- Tracking logic lives entirely in `background.js` (service worker)
- No popup or content scripts

---

## UI / Design

### Color Palette

| Variable | Hex | Usage |
|---|---|---|
| `--bg-base` | `#181a29` | Page background |
| `--bg-surface` | `#1b2021` | Cards, panels |
| `--accent` | `#7a4a8e` | Primary brand purple |
| `--accent-hover` | `#b89bc4` | Hover states |
| `--accent-subtle` | `rgba(122,74,142,0.12)` | Subtle tints |
| `--color-lavender` | `#e5d0f0` | Light lavender highlights |
| `--text-primary` | `#f3e2d6` | Main text (warm off-white) |
| `--text-muted` | `#debcb2` | Secondary text (muted beige) |
| `--border` | `rgba(184,155,196,0.25)` | Borders and dividers |
| `--green` | `#4caf50` | Success / complete |
| `--orange` | `#ff6b35` | Warning / partial |
| `--red` | `#ef4444` | Error / incomplete |

### Typography

| Role | Font |
|---|---|
| Headings (`h1`–`h6`) | League Spartan |
| Body text | Playfair Display + Lato |

Base font size: `14px`, line-height: `1.5`.

### Layout

- Full-height flex layout: `Sidebar` (collapsible, 56px collapsed / 220px expanded) + scrollable `<main>`
- Main content padding: `32px 36px`
- Custom scrollbar: 6px, `--border` color, 3px radius
- Dark mode only — no light mode

### Component Patterns

- `PageHeader` — consistent title + subtitle on every tracker page
- `StatCard` — metric display with label, value, optional trend
- `SheetTable` — generic table for Google Sheets data (headers from sheet, rows editable inline)
- Status indicators use `--green` / `--orange` / `--red` CSS variables, not Tailwind color classes

---

## Content

### Trackers and What They Track

**Habits** — 6 fixed daily habits:
- `read_books`, `breathwork`, `morning_pages`, `movement_prompt`, `brush_twice`, `movement_video`

**Mood** — Logged up to 3× per day (morning / afternoon / night). Rating 1–5, plus music listened.

**Food** — Per-meal logging (breakfast / lunch / dinner / snack) + a weekly meal prep plan stored per `week_start` date.

**Movement & Dance** — Logs type (walk / exercise / dance), duration in minutes, and optional notes. Daily movement prompts stored separately.

**Sleep** — One entry per day: bedtime, wake time, quality rating 1–5, notes.

**Productivity** — Passive; the Chrome extension tracks per-site minutes per day for ~20 sites and syncs to `productivity_daily.data_json`.

**Google Sheets trackers** (Networking, Job Apps, Finances, Tech Learnings, Content Creation) — Data lives in the shared Google Spreadsheet (ID in `.env`). Each tracker maps to one sheet tab.

### Google Sheets Spreadsheet

Spreadsheet ID stored in `GOOGLE_SHEETS_ID` env var. Tabs:

| Tab name | Tracker |
|---|---|
| `networking` | Networking |
| `applications` | Job Applications |
| `finances` | Finances |
| `learnings-before-nyu` | Tech Learnings |
| `content-creation` | Content Creation |
| `project-documentation` | (internal docs) |

---

## Testing

There is currently no automated test suite. Validation happens manually:

- Run `npm run build` in both `client/` and `server/` to catch TypeScript errors
- Run `npm run lint` in `client/` for ESLint issues
- Smoke-test routes via the browser or a REST client against `http://localhost:3001/api/*`

When adding tests in the future, prefer integration tests that hit the real SQLite database over mocks.

---

## File & Content Rules

- **Never commit** `sheets-credentials.json` or `sheets-token.json` — these are secret OAuth files
- **Never commit** `.env` files
- **Never commit** `server/data/*.db` — the database is local state, not source
- `node_modules/` and `dist/` are always ignored
- All environment variables go through `server/src/config.ts` — no raw `process.env` access in route handlers
- New Google Sheets tabs must be added to `server/src/index.ts` using `sheetsRoute()` — do not create a new route file for each tab
- New SQLite tables must be added in `server/src/db.ts` with the table name, schema, and `CREATE TABLE IF NOT EXISTS`
- New tracker pages go in `client/src/pages/` and must be added to `App.tsx` and `Sidebar`

---

## Future Updates

- **UI polish pass** — several pages need visual updates (layout, spacing, component styling) once designs are finalized
- **Student Life tracker** — currently a stub; needs Google Sheets tab configured and UI built out
- **Data export** — ability to export SQLite data as CSV
- **Charts / trends** — historical charts for mood, sleep quality, habits streak
- **Habit streak tracking** — current longest/current streak display on the Habits page
- **Mobile-friendly layout** — sidebar and grid currently optimized for desktop only
- **Extension popup** — optional UI to show today's usage without opening the dashboard
- **Unified error states** — consistent error and empty-state UI across all pages
