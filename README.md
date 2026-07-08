# Fluent

A calm, daily practice space for people who stammer. Fluent isn't a clinical
tool — it's a companion for paced, rhythmic speaking practice, built around one
well-crafted phrase, a private recording, and the ability to hear your own
voice change over time.

## Stack

- Next.js (App Router, PWA-installable)
- Supabase (email auth, Postgres, private Storage for recordings)
- Tailwind CSS v4
- wavesurfer.js for waveform playback

## Setup

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then open the SQL
Editor and run everything in [`supabase/schema.sql`](./supabase/schema.sql).
That creates the `profiles` and `practice_sessions` tables, row-level security
policies, and a private `recordings` Storage bucket.

In **Authentication → URL Configuration**, add your local and deployed URLs
(e.g. `http://localhost:3000/auth/callback` and
`https://your-domain.vercel.app/auth/callback`) as redirect URLs. Fluent uses
passwordless email magic links, so no extra auth provider setup is needed.

### 2. Configure environment variables

```bash
cp env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
your Supabase project's **Settings → API** page.

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with your email,
click the magic link, answer the two onboarding questions, and you're in.

## How it's organized

```
app/
  login/            Email magic-link sign in
  auth/callback/     Exchanges the magic-link code for a session
  onboarding/         Name + baseline confidence (first visit only)
  home/               Greeting, streak, CTA into practice
  practice/           The daily paced-reading + recording session
  progress/           Recordings list, then-vs-now, self-rating trend
components/
  practice/           Consent screen, phrase display, pace picker, rating
  progress/           Waveform player, trend chart, delete control
lib/
  supabase/           Browser/server Supabase clients + session refresh
  phrase.ts           The single practice phrase and pacing presets
  useAudioRecorder.ts  MediaRecorder wrapper
  usePhraseHighlighter.ts  Word-by-word highlight timing
  streak.ts           Consecutive-day streak calculation
supabase/schema.sql   Tables, RLS policies, Storage bucket + policies
```

## Deploying

Deploy-ready for [Vercel](https://vercel.com/new): import the repo, add the
same two `NEXT_PUBLIC_SUPABASE_*` environment variables, and deploy. Add the
deployed URL's `/auth/callback` path to Supabase's redirect URL allowlist.

## Notes

- Recordings live in a **private** Storage bucket; the app reads them back via
  short-lived signed URLs, never public links.
- There's intentionally one phrase, no gamification, and no AI feedback — see
  the product brief for why.
