# HH Tracker

Personal tracker for job applications (primarily [hh.ru](https://hh.ru)): a list, statuses, notes, and a stats dashboard.

Data is stored locally; vacancies can be added manually, by URL, or via CSV.

## Features

- Dashboard: KPIs and charts (Recharts)
- Application list with search and filters (status, company, dates)
- Application card: edit status, dates, notes, delete
- Add: manually, by `hh.ru/vacancy/{id}` URL, CSV import
- Themes: light / dark / system
- **Enter demo** on the login page — opens the dashboard with 74 sample applications
- **Load demo** on the dashboard — overwrites current data with the demo set

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite
- iron-session (password login)
- Recharts, motion, next-themes

## Quick start

```bash
cp .env.example .env
# set APP_PASSWORD and SESSION_SECRET (at least 32 characters)

npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Sign in:**

1. Password from `APP_PASSWORD`, or
2. **Enter demo** — no password, with sample data immediately

## How to use

| Page                 | What to do                                         |
| -------------------- | -------------------------------------------------- |
| `/`                  | Stats, Load demo                                   |
| `/applications`      | List, Add / From URL / Import CSV                  |
| `/applications/[id]` | Details, edit, delete                              |

### Ways to add an application

1. **Manually** — vacancy, company, date, status, salary, notes
2. **By URL** — a URL like `https://hh.ru/vacancy/123456`; the app tries to fetch the title and company via the public `GET /vacancies/{id}` (needs `HH_USER_AGENT`). If hh does not return data, create the application manually
3. **CSV** — see the format below

## Statuses

| id          | Label            |
| ----------- | ---------------- |
| `sent`      | Application sent |
| `viewed`    | Viewed           |
| `invite`    | Invitation       |
| `interview` | Interview        |
| `offer`     | Offer            |
| `reject`    | Rejection        |
| `archived`  | Archived         |

## CSV

Required columns: `vacancyName`, `employerName`, `appliedAt`, `status`.

```csv
vacancyName,employerName,appliedAt,status,vacancyUrl,areaName,isRemote,salaryFrom,salaryTo,notes
Frontend React,Яндекс,2026-07-01,invite,https://hh.ru/vacancy/123,Москва,250000,350000,
Middle Frontend,Тинькофф,2026-07-05,sent,https://hh.ru/vacancy/456,Москва,220000,300000,Жду ответ
```

`appliedAt` — a date `Date` can parse (for example `2026-07-01` or ISO).  
`status` — one of the ids from the table above.

## Environment variables

| Variable         | Description                                                                    |
| ---------------- | ------------------------------------------------------------------------------ |
| `APP_PASSWORD`   | Login password                                                                 |
| `SESSION_SECRET` | Cookie session secret (at least 32 characters)                                 |
| `DATABASE_URL`   | SQLite, default `file:./dev.db`                                                |
| `HH_USER_AGENT`  | User-Agent for the public vacancy API, like `HhTracker/1.0 (you@example.com)`  |

See [`.env.example`](.env.example).

## Project structure

```
hh-tracker/
  prisma/           # schema, seed
  src/
    app/            # pages, API routes
    components/     # UI, charts, forms, theme
    lib/            # db, session, stats, statuses, vacancy helper
  middleware.ts     # session route protection
```

## Limitations

- No auto-import of applications from a personal hh account
- A public vacancy request by URL may fail (anti-bot / rate limits) — manual entry and CSV always work
- Data is local SQLite only (`prisma/dev.db`); the app is designed for a single user
