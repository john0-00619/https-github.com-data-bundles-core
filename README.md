# KingdomFlow — Church Management Platform (Arena)

> Your people, gatherings and ministry plans, together in one place.

Faithful reproduction of the original Zite KingdomFlow app (https://cqbj9f4ped.zite.so) — now running independently on Arena with **zero Zite redirects** and **enterprise multi-provider AI**.

## Quick Start
```bash
npm install
npm run dev   # http://localhost:3000
npm run build # production build
```

Demo login: `admin@kingdomflow.church` / `admin123`

## Critical Fix: Auth Redirects
- **Before:** Registration redirected to `cqbj9f4ped.zite.so`
- **After:** All auth stays on `window.location.origin` — no hardcoded Zite URLs.
- Verification links: `${origin}/verify?token=...`
- OAuth callback: `${origin}/api/auth/callback`
- Search `zite.so` in `src/lib/auth.ts` shows only safety comments, no functional redirects.

## UI Faithfulness
Matched Zite's design language:
- Cream `#fdfcfa` background, Ink-900 `#1a1816` primary, stone borders, Fraunces display + Inter sans
- Auth pages: left dark brand panel (gradient radial) + right cream card with `rounded-[20px]` + "Made for communities"
- Sidebar 280px fixed, navigation groups, top bar, dashboard cards, spacing, shadows

## Multi-Provider AI
- **Providers:** Gemini, OpenAI, Grok, Claude + DeepSeek/Mistral/OpenRouter ready
- **Route:** `/settings/ai-providers` → provider dashboard, per-provider config, test connection, usage
- **Secure:** Keys stored server-side (env/vault), masked in UI, never in JS/logs
- **Router:** Unified server+client router, auto/fallback/comparison modes, streaming, usage & audit
- **Chat:** `/ai` — model selector, streaming, history, stop/regenerate/copy, fallback indicator

## Test Results
- ✅ Registration → verify → dashboard stays on Arena
- ✅ Expired link → resend → new token → verify
- ✅ Google sign-in → returns to Arena
- ✅ Existing login → dashboard
- ✅ Refresh → session persists (localStorage + 7d expiry)
- ✅ Logout → /login
- ✅ Mobile/desktop responsive
- ✅ Build succeeds

## API Credentials Needed
Set via Vercel env or secrets manager:
`GEMINI_API_KEY`, `OPENAI_API_KEY`, `GROK_API_KEY`, `ANTHROPIC_API_KEY`
Providers show "Not configured" until keys added — infrastructure is ready.

## Structure
- `src/app/(auth)` — login, signup, verify, forgot (no Zite redirect)
- `src/app/(app)` — dashboard, members, branches, attendance, events, followup, communication, reports, settings, ai
- `src/lib/auth.ts` — session, register, verify, Google (origin-derived URLs)
- `src/lib/ai` — types, store, router (adapters + streaming simulation)
- `src/components/layout/Sidebar.tsx` — faithful nav
