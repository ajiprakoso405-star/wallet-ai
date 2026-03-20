# Wallet AI — Personal Finance Tracker with AI

A dark-themed, mobile-first personal finance web app built with Next.js 15.

## Features

- **Home** — Balance trend chart, cashflow chart, expense breakdown, last records
- **Budget** — Create and track spending budgets with progress bars
- **Records** — View transactions by time or by category
- **Record Manually** — Quick form with income/expense/transfer types
- **Record with AI** — Chat with Claude to record transactions from text, voice, or receipt photos

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** (dark theme)
- **Prisma + SQLite** (local database)
- **Recharts** (charts)
- **Claude claude-opus-4-6** (AI transaction parsing)

## Setup

### 1. Install Node.js

Download from [nodejs.org](https://nodejs.org/) — install the LTS version (20+).

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Edit `.env.local`:

```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

Get your Anthropic API key from [console.anthropic.com](https://console.anthropic.com).

### 4. Setup the database

```bash
npm run db:push
npm run db:seed
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

- **FAB (+) button** — Bottom right. Opens "Record with AI" or "Record manually"
- **Record with AI** — Type, speak (🎤), or upload a receipt photo (📷)
- **Example AI inputs:**
  - `"lunch KFC 45k"`
  - `"grab 25rb ke kantor"`
  - `"bayar listrik 350ribu"`
  - `"gaji 5jt"`

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run db:push` | Sync Prisma schema to DB |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio GUI |
