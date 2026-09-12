# Fluent

A calm, daily practice space for people who stammer. Fluent isn't a clinical
tool — it's a companion for paced, rhythmic speaking practice: reading text,
mantra chanting, Sanskrit sound foundations, practice for specific words that
feel hard, and rehearsing real-life moments before they happen — each with a
private recording and the ability to hear your own voice change over time.

## Stack

- Next.js (App Router, PWA-installable)
- Supabase (email auth, Postgres, private Storage for recordings)
- Tailwind CSS v4
- wavesurfer.js for waveform playback
- Gemini (live reading-passage generation during Practice, plus an optional
  offline batch script — see below; also used by the AI Mentor, see below)
- ElevenLabs (optional, Quick Calm narration only — see below)

## Setup

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then open the SQL
Editor and run, **in order**, everything in `supabase/schema.sql` and then
each `supabase/migration_00N_*.sql` file in numeric order (currently through
`migration_010`). Each file's header comment explains what it adds; skim
`supabase/schema.sql` and the migration files directly rather than relying on
a list here going stale.

In **Authentication → URL Configuration**, add your local and deployed URLs
(e.g. `http://localhost:3000/auth/callback` and
`https://your-domain.vercel.app/auth/callback`) as redirect URLs. Fluent uses
passwordless email magic links, so no extra auth provider setup is needed.

### 2. Configure environment variables

```bash
cp env.example .env.local
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from
Settings → API) are required. `GEMINI_API_KEY` is optional but powers live
Reading Practice passage generation and the AI Mentor (see below) — without
it the app falls back to the curated `text_bank` pool and Mentor feedback
simply won't generate. Everything else in `env.example` is optional and only
used by offline scripts, never by the running app.

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
  (dashboard)/                  Sidebar-nav shell: home, progress, mentor, settings
  (focused)/                    Full-bleed, distraction-free session shell:
                                 practice, mantra, sound-foundations,
                                 trigger-words, scenarios, quick-calm
  api/generate-passage/         Live Gemini passage generation (server-only)
app/login, app/onboarding, app/auth/callback   Pre-auth flow
components/
  shell/                        DashboardShell (sidebar) and FocusTopBar/Footer
  nav/                          Sidebar + mobile nav, icon set
  practice/                     Consent, breathing transition, phrase/akshara/
                                 trigger-word display, pickers, live waveform,
                                 session rating screen, completion screen
  progress/                     Waveform player, trend chart, weekly heatmap,
                                 achievement badges, type filter, progress view
  quickcalm/                    Avatar, breathing-shape visuals, the two
                                 exercise players (timed-audio and Web Speech)
  scenario/                     Scene backgrounds for Practice a Moment
  mentor/                       Consent/naming screens, crisis resource card,
                                 the Mentor tab view (see AI Mentor, below)
lib/
  supabase/                     Browser/server Supabase clients + session refresh
  settings/SettingsContext.tsx  Persistent 432Hz/no-pressure-mode/mentor settings
  phrase.ts, mantras.ts, varnamala.ts, triggerWords.ts, scenarios.ts   Static content
  quickCalmScript.json          Single source of truth for Quick Calm narration
                                 text — read by both lib/quickCalm.ts (runtime)
                                 and scripts/generate-quickcalm-audio.mjs
  textBank.ts                   Reading-text + scenario-passage selection
  generatePassage.ts            Client helper for live Gemini generation
  usePhraseHighlighter.ts       Word/akshara highlight timing (supports looping)
  useAudioRecorder.ts           MediaRecorder wrapper (exposes live stream)
  useSessionSave.ts             Shared upload + practice_sessions insert
  useScenarioSave.ts            Same, for scenario_sessions
  useAmbientNoise.ts            Synthesized (Web Audio) ambient bed per scenario
  badges.ts                     Achievement badge computation
  streak.ts                     Consecutive-day streak calculation
  mentor/safety.ts              Deterministic crisis-language screening
scripts/
  generate-passages.mjs         Optional offline batch: Gemini → text_bank
  generate-quickcalm-audio.mjs  Offline batch: ElevenLabs → public/audio/quick-calm
supabase/schema.sql             Base schema
supabase/migration_00N_*.sql    Everything since, in order
```

## Practice modules

- **Practice** — dynamic reading text (category + length + difficulty +
  pace), or the weekly voice journal (`/practice?mode=journal`, unscored).
  Difficulty (easy/medium/hard) defaults to a suggestion based on how many
  reading sessions you've completed (`suggestDifficulty` in
  `lib/textBank.ts`), but is always user-overridable.
- **Mantra** — Om, Om Namah Shivaya, or the Gayatri Mantra, looping until you
  stop.
- **Sound Foundations** — a Sanskrit varnamala trainer: vowels, consonants,
  then consonant+vowel combinations.
- **Words That Challenge Me** — practice specific words (built-in categories
  or your own) through three graduated levels: isolation, short phrase, full
  sentence.
- **Practice a Moment** (`/scenarios`) — rehearse a real situation: an
  interview intro, a lecture opening, a classroom reading, hosting a show.
  Level 1 only: a soft scene background + a synthesized ambient sound bed
  (no real audio assets — see `lib/useAmbientNoise.ts`) + the same
  word-highlight reading mechanic as Reading Practice. **No camera, no
  `getUserMedia` for video** — that's an explicitly deferred future phase.
  If you've saved any words under Words That Challenge Me, scenario passages
  containing a `{trigger_word_slot}` placeholder are preferred and filled in
  with one of your own words; otherwise a plain version is used.

All five save immediately on finish (`self_rating` null) and lead to a
completion screen where **"Do it again" is the primary action** — replaying
skips straight back into the same content (a fresh pick for Reading and
Scenarios) without re-showing setup. Rating ("How did that feel?") is a
secondary, optional link that updates the already-saved row via
`updateRating` rather than gating completion on it. Practice/Mantra/Sound
Foundations/Trigger Words share `practice_sessions` (`lib/useSessionSave.ts`,
tagged by `practice_type`); Scenarios has its own `scenario_sessions` table
(`lib/useScenarioSave.ts`) since its shape differs enough not to force-fit.
Both tables feed the same Progress view, streak, and badge calculations —
`lib/unifiedSessions.ts` normalizes a row from either table into one shared
shape for display, so a scenario recording is just as visible, playable,
deletable, and streak-counted as any other practice session, without the
two tables actually merging.

### Reading & scenario content pipeline

Each time you start or replay a Reading Practice session, `app/api/generate-passage`
asks Gemini for 10 fresh passages matching your chosen category, length,
difficulty, and pace, in one structured-JSON call (so Gemini varies sentence
openers within a batch); the valid ones are inserted into `text_bank` under
your own signed-in session (no service-role key needed for this path — see
`migration_006`'s `text_bank` insert policy), and one is picked for you. The
call happens **during the breathing transition screen**, so its latency is
hidden rather than making you wait on a spinner. If `GEMINI_API_KEY` is
unset, the call errors, or a generated passage fails validation, it falls
back to `pickText()` against the existing curated pool — you'll never see an
error, just a pre-written passage instead of a freshly generated one.

`scripts/generate-passages.mjs` remains available as an optional way to
bulk-seed the pool ahead of time (e.g. before a demo, or to pad the fallback
pool):

```bash
# needs GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
npm run generate:passages                        # every category × pace × length
npm run generate:passages -- --category=work      # just one combination
```

`SUPABASE_SERVICE_ROLE_KEY` (Settings → API — **not** the anon key) is
required only for this script, since it runs with no signed-in user and
needs to bypass RLS; keep it out of version control and never use it
client-side.

`lib/textBank.ts` is the shared read path — `pickText()` for ordinary
reading (always excluding scenario-tagged rows, so a stray
`{trigger_word_slot}` placeholder never shows up outside Practice a Moment)
and `pickScenarioPassage()` for scenarios. Scenario passages are not yet
generated live; they're seeded by the batch script only.

## In-the-moment comfort features

Separate from scheduled practice, none scored or streak-tracked:

- **Quick Calm** (`/quick-calm`) — four short, avatar-guided breathing
  exercises (physiological sigh, box breathing, alternate nostril, third-eye
  body awareness), reachable in one tap from Home and from both app shells.
  "Do it again" replays instantly. `components/quickcalm/ExercisePlayer.tsx`
  picks between two players per exercise:
  - **Timed** (`TimedExercisePlayer.tsx`) — used when
    `scripts/generate-quickcalm-audio.mjs` has produced real ElevenLabs
    audio + a per-line timing JSON for that exercise. Captions are driven by
    the `<audio>` element's actual `timeupdate` progress against measured
    timestamps, not a declared pause duration — the original caption-drift
    bug came from assuming a requested pause matches what the engine really
    produces, so this measures the real thing instead of assuming it.
  - **Speech** (`SpeechExercisePlayer.tsx`) — Web Speech API fallback, used
    automatically whenever the audio/timing files don't exist yet. Pauses
    start when the browser's `end` event actually fires, with a watchdog
    timeout as a safety net in case that event never comes (a known flaky
    spot in browser TTS) so an exercise can't get stuck.

  ```bash
  # needs ELEVENLABS_API_KEY (and optionally ELEVENLABS_VOICE_ID) in .env.local
  npm run generate:quickcalm-audio
  ```

  This build has no ElevenLabs account, so the timed player is untested
  against real audio — it's built and ready, but you'll need to run the
  script and confirm caption sync yourself.
- **"That was hard"** — a lightweight sentiment + optional note check-in,
  no recording, reachable from the Quick Calm hub.
- **My Affirmations** — bookmark any line during Reading Practice (the icon
  next to the "Time spent" pill) and revisit it statically later, from Quick
  Calm or Settings.
- **Daily check-in** — a dismissible one-tap mood card on Home, independent
  of whether you practice that day.

## AI Mentor (in progress — part 1 of 2)

A supportive companion, reachable from its own nav tab (`/mentor`), that
reflects on saved sessions — **not** a therapist, and never a diagnostic
tool. This is genuinely sensitive territory, so it's being built in two
explicitly separated phases:

**Part 1 — shipped in this change:**
- **Consent flow** (`components/mentor/MentorIntro.tsx`,
  `MentorNaming.tsx`) — a first-visit intro explaining plainly what the
  companion is and isn't, a `[Let's meet]` / `[Skip for now]` choice, and an
  optional naming step (defaults to "Kai"). Skipping still marks onboarding
  complete (`profiles.mentor_onboarded_at`) so it won't nag on the next
  visit, but the intro copy stays one tap away forever via "About your
  companion" (`/mentor?view=about`), linked from both the Mentor tab and
  Settings.
- **Safety guardrail** (`lib/mentor/safety.ts`) — a deterministic
  keyword/phrase screen for crisis language (suicidal ideation, self-harm,
  hopelessness, burden ideation), run as a hard pre-check **before** any
  AI-generated response would touch the text, not something an LLM is
  trusted to self-regulate. It currently covers the "That was hard" free-text
  check-in note (`app/(app)/(focused)/quick-calm/page.tsx`) — the only
  free-text input that exists in the app today. When it matches, the normal
  flow is skipped entirely and a distinct `CrisisResourceCard` is shown
  instead, with India-specific helplines (Tele-MANAS, Vandrevala Foundation,
  iCall — numbers verified via web search in July 2026, worth re-verifying
  periodically) and a link to findahelpline.com for anyone elsewhere. The
  check-in itself is still saved before screening runs, so a person's words
  are never silently discarded; a flagged, textless row is logged to
  `mentor_reflections` (`flagged_for_safety = true`) rather than ever being
  sent onward for AI engagement.
- **Settings** — separate "Mentor feedback" and "Mentor voice-over" toggles
  (`profiles.mentor_feedback_enabled` / `mentor_voice_enabled`), plumbed
  through `SettingsContext` alongside the existing 432Hz/no-pressure-mode
  pattern.
- **Mentor tab** — currently an honest empty-state feed ("Nothing here yet
  — after you save a practice session, {name} will leave a note here"),
  since Part 2 hasn't been built yet.

**Explicitly deferred to Part 2**, only after this part is confirmed
working: the actual reflection-generation pipeline (WPM from known passage
word count ÷ recording duration, pause/silence-gap analysis from recorded
audio amplitude, 5-session trend, the mentor system prompt, session-summary
card integration, "Read this aloud," and the No-Pressure-Mode "left you a
note" pill). One honest gap worth flagging now: there's no speech-to-text
integration in this codebase, so a spoken transcript is not available input
for Part 2 — WPM and pause analysis will have to work from duration/amplitude
alone, and the crisis-language guardrail above can only screen typed text,
not the weekly voice journal, until that changes.

## Settings

- **432Hz calming tone** plays continuously across the whole app while
  enabled — mounted once at the root (`components/AmbientTone.tsx`, inside
  `app/(app)/layout.tsx`), not per-screen — and ducks out automatically
  while any recorder is capturing audio (`useAudioRecorder` reports this
  into `SettingsContext.recordingActive`), resuming once you stop. Browsers
  suspend a freshly created `AudioContext` until a user gesture; `useTone432`
  retries `resume()` on the next click/keypress so it starts as soon as it's
  allowed to.
- **No-pressure mode** (skips the post-session sentiment check-in) is
  stored on the user's profile and applies across every practice module,
  not just the screen it was toggled on.
- **Mentor feedback** and **Mentor voice-over** — see AI Mentor, above.

## Deploying

Deploy-ready for [Vercel](https://vercel.com/new): import the repo, add the
two `NEXT_PUBLIC_SUPABASE_*` environment variables, and deploy. Add the
deployed URL's `/auth/callback` path to Supabase's redirect URL allowlist.
Run the offline scripts locally (or in CI) — they're never invoked by the
deployed app itself, only by you, ahead of time.

## Notes

- Recordings live in a **private** Storage bucket; the app reads them back via
  short-lived signed URLs, never public links.
- The migrations seed a representative sample of `text_bank` content — the
  batch script (above) is the intended way to grow the pool from there.
