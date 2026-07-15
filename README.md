# Fluent

A calm, daily practice space for people who stammer. Fluent isn't a clinical
tool — it's a companion for paced, rhythmic speaking practice: reading text,
mantra chanting, Sanskrit sound foundations, and practice for specific words
that feel hard, each with a private recording and the ability to hear your
own voice change over time.

## Stack

- Next.js (App Router, PWA-installable)
- Supabase (email auth, Postgres, private Storage for recordings)
- Tailwind CSS v4
- wavesurfer.js for waveform playback

## Setup

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then open the SQL
Editor and run, **in order**:

1. [`supabase/schema.sql`](./supabase/schema.sql) — `profiles` and
   `practice_sessions` tables, RLS policies, and a private `recordings`
   Storage bucket.
2. [`supabase/migration_002_practice_modules.sql`](./supabase/migration_002_practice_modules.sql) —
   persistent settings columns, the dynamic `text_bank`, the `trigger_words` /
   `user_trigger_words` tables, and `practice_type` on `practice_sessions`.
3. [`supabase/migration_003_comfort_features.sql`](./supabase/migration_003_comfort_features.sql) —
   `quick_calm_sessions`, `moment_checkins`, `user_saved_affirmations`, and
   `daily_checkins`.

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
app/(app)/                      Authenticated routes, wrapped in SettingsProvider
  (dashboard)/                  Sidebar-nav shell: home, progress, settings
  (focused)/                    Full-bleed, distraction-free session shell:
                                 practice, mantra, sound-foundations, trigger-words
app/login, app/onboarding, app/auth/callback   Pre-auth flow
components/
  shell/                        DashboardShell (sidebar) and FocusTopBar/Footer
  nav/                          Sidebar + mobile nav, icon set
  practice/                     Consent, breathing transition, phrase/akshara/
                                 trigger-word display, pace/length/category
                                 pickers, live waveform, session rating screen
  progress/                     Waveform player, trend chart, weekly heatmap,
                                 achievement badges, type filter, progress view
lib/
  supabase/                     Browser/server Supabase clients + session refresh
  settings/SettingsContext.tsx  Persistent 432Hz + no-pressure-mode settings
  phrase.ts, mantras.ts, varnamala.ts, triggerWords.ts   Static content
  textBank.ts                   Dynamic text selection (category/length, avoids repeats)
  usePhraseHighlighter.ts       Word/akshara highlight timing (supports looping)
  useAudioRecorder.ts           MediaRecorder wrapper (exposes live stream)
  useSessionSave.ts             Shared upload + practice_sessions insert
  badges.ts                     Achievement badge computation
  streak.ts                     Consecutive-day streak calculation
supabase/schema.sql                          Base schema
supabase/migration_002_practice_modules.sql  Practice modules schema
```

## Practice modules

- **Practice** — dynamic reading text (category + length + pace), or the
  weekly voice journal (`/practice?mode=journal`, unscored).
- **Mantra** — Om, Om Namah Shivaya, or the Gayatri Mantra, looping until you
  stop.
- **Sound Foundations** — a Sanskrit varnamala trainer: vowels, consonants,
  then consonant+vowel combinations.
- **Words That Challenge Me** — practice specific words (built-in categories
  or your own) through three graduated levels: isolation, short phrase, full
  sentence.

All four save through the same shared recorder, storage upload, and
`practice_sessions` insert (`lib/useSessionSave.ts`), tagged by
`practice_type`.

## In-the-moment comfort features

Separate from scheduled practice, none scored or streak-tracked:

- **Quick Calm** (`/quick-calm`) — four short, avatar-guided breathing
  exercises (physiological sigh, box breathing, alternate nostril, third-eye
  body awareness), reachable in one tap from Home and from both app shells.
  Voice-over uses the browser's built-in **Speech Synthesis API**
  (`lib/useSpeechVoiceover.ts`), not pre-generated ElevenLabs audio — this
  build has no ElevenLabs account or audio-hosting pipeline. Swapping in
  hosted narration later just means pointing `speak()` at an `<audio>`
  element instead.
- **"That was hard"** — a lightweight sentiment + optional note check-in,
  no recording, reachable from the Quick Calm hub.
- **My Affirmations** — bookmark any line during Reading Practice (the icon
  next to the "Time spent" pill) and revisit it statically later, from Quick
  Calm or Settings.
- **Daily check-in** — a dismissible one-tap mood card on Home, independent
  of whether you practice that day.

## Settings

- **432Hz calming tone** and **no-pressure mode** (skips the post-session
  sentiment check-in) are stored on the user's profile and apply across every
  practice module, not just the screen they were toggled on.

## Deploying

Deploy-ready for [Vercel](https://vercel.com/new): import the repo, add the
same two `NEXT_PUBLIC_SUPABASE_*` environment variables, and deploy. Add the
deployed URL's `/auth/callback` path to Supabase's redirect URL allowlist.

## Notes

- Recordings live in a **private** Storage bucket; the app reads them back via
  short-lived signed URLs, never public links.
- `supabase/migration_002_practice_modules.sql` seeds a representative sample
  of `text_bank` phrases and `trigger_words` per category — add more rows
  following the same shape to grow the pool.
