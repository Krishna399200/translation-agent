# Deploy guide

## Live site (Netlify)

- **Site URL:** https://translation-agent-sai.netlify.app
- **Dashboard:** https://app.netlify.com/projects/translation-agent-sai

## 1. Add Gemini API key on Netlify

The key is **not** in git. Add it in Netlify:

1. Open [Site settings → Environment variables](https://app.netlify.com/projects/translation-agent-sai/configuration/env)
2. Add:
   - `GEMINI_API_KEY` = your key from [AI Studio](https://aistudio.google.com/apikey)
   - Optional: `GEMINI_MODEL` = `gemini-2.5-flash-lite`

## 2. Push to GitHub

Complete GitHub login (one-time):

```powershell
gh auth login
```

Choose: GitHub.com → HTTPS → Login with browser.

Then create the repo and push:

```powershell
cd "c:\Users\Acer\Dropbox\My PC (LAPTOP-L1J9LF8I)\Documents\aiCodeProjects\translation-agent"
gh repo create translation-agent --public --source=. --remote=origin --push
```

## 3. Connect GitHub to Netlify (recommended)

Local `netlify deploy` can fail on Windows/Dropbox (symlink permissions).  
**Use Git-based deploy** so Netlify builds on Linux:

1. [Netlify project → Build & deploy → Link repository](https://app.netlify.com/projects/translation-agent-sai/link)
2. Choose GitHub → `translation-agent` repo
3. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish: `.next`
4. Deploy — Netlify rebuilds on every `git push`

## 3-translation limit

- Each browser gets a `visitor_id` cookie
- Usage is stored in **Netlify Blobs** (production)
- After 3 successful translations → **Limit exceeded**

## Local dev

```powershell
copy env.example .env.local
# add GEMINI_API_KEY
npm run dev
```

Usage limit uses in-memory fallback when Blobs are unavailable (`next dev`).
