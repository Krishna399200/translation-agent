# Translation Agent — Step-by-Step Learning Guide

Welcome! This project teaches you how to build an AI file-translation app using **Next.js**, **Node.js**, and **Google Gemini**.

We start with **Excel only**. Word and PDF come in later steps.

---

## What you have right now

```
translation-agent/
├── app/
│   ├── page.tsx                 ← Home page (what you see in the browser)
│   └── api/translate/route.ts   ← Backend API (server-side)
├── components/
│   └── TranslationForm.tsx      ← Upload form (runs in browser)
├── lib/
│   ├── gemini.ts                ← Connects to Gemini
│   ├── translate.ts             ← Sends text to Gemini for translation
│   ├── extract/xlsx.ts          ← Reads text from Excel cells
│   ├── rebuild/xlsx.ts          ← Writes translated text back
│   └── pipeline/translate-xlsx.ts ← Ties the steps together
└── env.example                  ← Template for your API key
```

---

## Step 0 — Prerequisites

Install on your machine:

- [Node.js](https://nodejs.org/) (LTS version, e.g. 20 or 22)
- A code editor (you're already using Cursor)

---

## Step 1 — Get your Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **Create API key**
4. Copy the key

---

## Step 2 — Configure the project

Open a terminal in the `translation-agent` folder:

```bash
# Copy the env template
copy env.example .env.local

# Edit .env.local and paste your real API key:
# GEMINI_API_KEY=AIza...
```

> `.env.local` is gitignored — your key stays on your machine.

---

## Step 3 — Run the app locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 4 — Test with an Excel file

1. Create a simple `.xlsx` in Excel or Google Sheets with a few English sentences
2. Upload it on the home page
3. Pick a language (e.g. Spanish)
4. Click **Translate & Download**
5. Open the downloaded file — cell text should be translated

---

## How the pipeline works (read the code in this order)

### 1. User uploads a file (`components/TranslationForm.tsx`)

- The browser sends `file` + `language` to `/api/translate` using `fetch` and `FormData`
- The API key is **never** sent to the browser

### 2. API route receives the request (`app/api/translate/route.ts`)

- Validates the file type (`.xlsx` only for now)
- Converts the file to a `Buffer` (raw bytes Node.js can process)
- Calls `translateXlsxFile()`

### 3. Extract text (`lib/extract/xlsx.ts`)

- Uses **exceljs** to open the workbook
- Loops through every sheet → row → cell
- Collects cells that contain real text (skips formulas and pure numbers)

### 4. Translate (`lib/translate.ts`)

- Sends batches of 20 cell texts to **Gemini**
- Gemini returns a JSON array of translated strings
- Long single strings are split into chunks first

### 5. Rebuild (`lib/rebuild/xlsx.ts`)

- Writes translated text back into the **same** workbook object
- Keeps styles, column widths, and sheet structure
- Exports a new `.xlsx` buffer

### 6. Download

- API returns the file as a download
- Browser saves it automatically

---

## Key concepts you're learning

| Concept | Where |
|--------|--------|
| Next.js App Router | `app/` folder |
| Server vs client code | `route.ts` (server) vs `"use client"` form |
| Environment variables | `.env.local` + `process.env.GEMINI_API_KEY` |
| File upload | `FormData` + `multipart/form-data` |
| AI API calls | `lib/gemini.ts` + `lib/translate.ts` |
| File parsing | `lib/extract/xlsx.ts` with exceljs |

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| `GEMINI_API_KEY is missing` | Create `.env.local` from `env.example` |
| `No translatable text found` | Add English/text cells (not only numbers) |
| Slow for big files | Normal — each batch calls Gemini; we'll optimize later |
| API quota errors | Free tier has limits; wait or upgrade in AI Studio |

---

## What's next (future steps)

When you're comfortable with Step 1, we'll add:

- **Step 2** — Word (.docx) translation
- **Step 3** — Simple PDF (text extraction)
- **Step 4** — Progress bar + better error messages
- **Step 5** — Optional "agent" pattern (extractor + translator + QA)

---

## Commands cheat sheet

```bash
npm run dev      # Start local server
npm run build    # Production build (optional check)
npm run lint     # Check code style
```

---

Happy learning! When Step 1 works on your machine, tell me and we'll move to Word documents.
