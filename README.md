# MemoryVaulto — Code Review

> **Repository:** [RatneshAmule/MemoryVaulto](https://github.com/RatneshAmule/MemoryVaulto)
> **Tagline:** *"When you can't speak, your vault does."*
> **Review Date:** 2026-06-20

---

## 1. Project Overview

**MemoryVaulto** is an **Emergency Medical Identity Vault** — a healthcare web application that gives hospitals and first responders instant access to a patient's critical medical history during emergencies, when the patient is unconscious or unable to communicate.

**Pitch (from landing page):** "Digital Human Memory Vault gives hospitals instant access to your critical medical history during emergencies — in 5 seconds, not 45 minutes." Claims to solve "23 problems" with "99 unique features" and an estimated "15,000+ lives saved/yr."

> ⚠️ The README in the repo itself is essentially empty (only `# MemoryVault` on both `main` and `master` branches). This review is based on direct code inspection.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16.1** (App Router) |
| Language | **TypeScript 5** |
| UI Library | **React 19** |
| Styling | **Tailwind CSS v4** + `tailwindcss-animate`, `tw-animate-css` |
| Component system | **shadcn/ui** (new-york style, ~44 components) + **Radix UI** primitives |
| Animations | Framer Motion |
| State | **Zustand** (client-side page routing + auth), TanStack Query/Table |
| Forms | react-hook-form + Zod |
| Database ORM | **Prisma 6** (PostgreSQL primary; SQLite schema also present) |
| Auth | **jsonwebtoken (JWT)** + **bcryptjs** (12 rounds), custom middleware |
| Charts | Recharts |
| Icons | lucide-react |
| Markdown/Editor | @mdxeditor/editor, react-markdown, react-syntax-highlighter |

**⚠️ Unused dependencies** (in `package.json` but never imported anywhere in `src/`):
- `z-ai-web-dev-sdk` (LLM SDK — note: the "AI" features are actually rule-based, see §6)
- `next-auth` (custom JWT auth is used instead)
- `next-intl` (no i18n setup)
- `@vercel/postgres` (Prisma is used instead)

**Scale:** ~21,900 lines of TS/TSX total — a substantial codebase.

---

## 3. Project Structure

```
MemoryVaulto/
├── README.md                  ← essentially empty ("# MemoryVault")
├── package.json               ← Next.js 16 stack, ~70 deps
├── components.json            ← shadcn/ui config (new-york style)
├── next.config.ts, tsconfig.json, eslint.config.mjs
├── tailwind.config.ts, postcss.config.mjs
├── prisma/
│   ├── schema.prisma          ← 574 lines, ~30 models (PostgreSQL)
│   ├── schema.sqlite.prisma   ← 527 lines (duplicate/leftover)
│   └── seed.ts                ← 486 lines, demo patients (Maria, James, Aiden, Amira…)
├── public/
│   ├── logo.svg, favicon.svg, og-image.png, robots.txt
└── src/
    ├── middleware.ts          ← JWT auth gate + security headers for /api/*
    ├── app/
    │   ├── layout.tsx, page.tsx, globals.css
    │   └── api/               ← ~75 route files, ~5,300 LOC
    │       ├── auth/{login,register}
    │       ├── patients/[id]/ … (20+ sub-resources: allergies, medications, conditions,
    │       │   surgeries, implants, vaccinations, contacts, consent-proxies,
    │       │   pharmacogenomics, genetic-flags, vital-baselines, blood-antibodies,
    │       │   cultural-directives, advance-directives, voice-messages, pain-profile,
    │       │   device-integrations, occupational-exposures, radiation-exposures,
    │       │   caregiver-passes, medical-tests, timeline-events, discharge-assessments,
    │       │   medication-adherence, surgeries, tests, sub/[sub])
    │       ├── emergency/[patientId]/{access,route,status}, search, notify
    │       ├── hospital/{dashboard,access-logs,organ-matches,outbreaks}
    │       ├── ai/{triage,red-flags,risk-score,clinical-notes,differential-diagnosis,
    │       │   discharge-assessment,medication-reconciliation,pediatric-dosing,
    │       │   surgery-checklist,treatment-firewall}
    │       ├── drugs/check, access-logs, seed, war-room/...
    │       └── route.ts
    ├── components/            ← ~15,500 LOC
    │   ├── ui/                ← 44 shadcn primitives
    │   ├── landing/, auth/, patient/ (+ patient/sections/), emergency/,
    │   │   hospital/, war-room/, ai-lab/, analytics/, demo/, vault/
    │   └── ...
    ├── stores/app-store.ts    ← Zustand global store (auth, page routing, patient)
    ├── lib/                   ← db.ts, jwt.ts, auth-middleware.ts, validation.ts, utils.ts
    └── hooks/                 ← use-mobile.ts, use-toast.ts
```

---

## 4. Key Features

The Prisma schema reveals an ambitious clinical data model with ~30 models:

- **Patient Vault** — allergies, medications, conditions (ICD-11), surgeries, implants (MRI-safety), vaccinations, emergency contacts, consent proxies, advance directives, cultural/religious directives, voice messages ("voice of the patient"), pain profile, pharmacogenomics, genetic flags (malignant hyperthermia, G6PD, etc.), vital baselines, blood antibodies, device integrations (CGM, pacemaker), occupational & radiation exposure tracking, caregiver access passes, medical timeline, discharge assessments, medication adherence.
- **Emergency Portal** — break-glass access with audit logging + automatic patient notifications; patient search by name/blood type.
- **Hospital Dashboard** — access logs, organ-match engine, outbreak radar.
- **"AI" Clinical Decision Support** (see caveat §6) — triage protocols, red-flag detection, risk scoring, differential diagnosis, drug-interaction checker, pediatric dosing, surgery checklist, discharge safety scoring, treatment firewall, medication reconciliation, clinical-note generation.
- **Family War Room** — real-time-ish status updates + messaging for families during a patient's hospitalization.
- **Demo Mode**, **Analytics**, **AI Lab** pages, plus a polished **landing page**.

---

## 5. How It Works (Architecture)

**Routing:** Despite being Next.js, the app uses **client-side page switching** via a Zustand `currentPage` enum (`landing | auth | patient-dashboard | emergency | hospital | access-logs | war-room | demo | ai-lab | analytics`) rendered in `src/app/page.tsx` — not Next.js file-based routing for the main views. Only `/api/*` uses Next route handlers.

**Auth flow:** `POST /api/auth/register` or `/login` → bcrypt-hashed password + JWT (8h expiry) issued. Token stored both in Zustand state and a `SameSite=Strict` cookie. `src/middleware.ts` gates all `/api/*` routes (except login/register), verifying JWT and enforcing role restrictions (e.g. `/api/hospital` requires admin/doctor/nurse/specialist). Per-route helpers `enforceAccess()` / `verifyPatientAccess()` in `lib/auth-middleware.ts` do finer-grained checks (patients can only read their own record).

**Data access:** Prisma singleton (`lib/db.ts`) with a global cache for dev hot-reload. Patient GET endpoint eagerly includes all ~25 related tables in one query.

**Emergency access:** `POST /api/emergency/[patientId]/access` creates an `AccessLog` (break-glass, 24h expiry) and pushes a `Notification` to the patient — a thoughtful audit/consent design.

**"AI" routes** are **deterministic rule engines**, not LLM calls. E.g. `/api/ai/triage` matches condition names against keyword lists (e.g. "atrial fibrillation" → Cardiac Protocol) and returns hardcoded step lists. `/api/ai/red-flags` scans for severe allergies, DNR, anticoagulants, etc. `/api/ai/clinical-notes` simply templates a SOAP note from DB fields. Despite `z-ai-web-dev-sdk` being a dependency, **no source file imports it**.

---

## 6. Code Quality Assessment

### ✅ Strengths

1. **Clinically literate domain modeling** — the Prisma schema is genuinely detailed (pharmacogenomics, cultural directives, radiation dose tracking — rare even in real EMRs).
2. **Bleeding-edge stack** — Next.js 16, React 19, Tailwind v4, Prisma 6.
3. **Security framework is more mature than typical hackathon work** — RBAC middleware, security headers (CSP, X-Frame-Options DENY, nosniff, Permissions-Policy), break-glass audit + patient notification, bcrypt 12 rounds.
4. **Well-typed** — Zod validation, TS interfaces mirroring Prisma models.
5. **Consistent structure** — RESTful nested routes, shadcn/ui throughout.

### 🔴 Critical Issues

#### Security holes

1. **`PUT /api/patients/[id]` has NO authorization check** — any authenticated user can overwrite *any* patient's blood type, DNR, organ-donor status. Serious clinical-safety bug.
2. **JWT secret has a weak hardcoded fallback** (`'change-me-in-production-use-strong-secret'`) — silently insecure if env var missing.
3. **Auth token stored in JS-accessible cookie** (not HttpOnly) — XSS-stealable. The code comment even admits it should be HttpOnly.
4. **`emergency/access` trusts `accessorId` from request body** instead of JWT — spoofing risk.
5. **No rate limiting** on login / break-glass endpoints.

#### Bugs / correctness

6. **Two broken route folders** (typos — missing opening `[`):
   - `…/medications/edicationId]/` → should be `[medicationId]`
   - `…/voice-messages/essageId]/` → should be `[messageId]`

   These PUT/DELETE endpoints silently never match a real URL — the routes are dead.

7. **Leftover SQLite workarounds** — `emergency/search` does in-memory `.filter()` for case-insensitive name matching with a comment "SQLite doesn't support mode: 'insensitive'" — but the active `schema.prisma` uses PostgreSQL, which *does* support it. Inefficient and stale.

8. **Duplicate schema** — `schema.sqlite.prisma` (527 lines) is dead weight that will drift out of sync.

#### Hygiene / completeness

9. **README is empty** — no description, setup, env-var list, architecture notes, or screenshots.
10. **No LICENSE file** — all rights reserved by default.
11. **No `.env.example`** — required vars (`DATABASE_URL`, `JWT_SECRET`) are undocumented.
12. **No tests** (no `.test.ts`/`.spec.ts`/`__tests__` anywhere) and **no CI** (no `.github/`).
13. **Unused dependencies** inflate the install/build (`z-ai-web-dev-sdk`, `next-auth`, `next-intl`, `@vercel/postgres`).
14. **Misleading "AI" labeling** — routes under `/api/ai/*` are rule-based heuristics; including the LLM SDK but not using it (and marketing "Healthcare AI") is a gap between claim and implementation.
15. **Commit history is minimal** — only 2 commits. Suggests a one-shot dump rather than iterative development.
16. The **war-room messaging** is plain REST polling — not real-time (no WebSockets/SSE), despite the "real-time" implication.

---

## 7. License

**None.** No `LICENSE` file exists. Under default copyright, the code is **"all rights reserved"** — no one may legally copy, modify, or distribute it without the author's permission. If the intent is open source, add a license (MIT / Apache-2.0 are common).

---

## 8. Screenshots / Demos

- **No screenshots or demo media** in the README.
- `public/og-image.png` (70 KB) exists for social sharing but isn't referenced in documentation.
- The app has an in-app **"Watch Demo"** button → `DemoModePage` component (client-side walkthrough with mock patients), but nothing recordable is shipped.

---

## 9. Recommendations (Prioritized)

### 🔥 Must fix (security/correctness)

1. Add an authorization check to `PUT /api/patients/[id]` (use `verifyPatientAccess`) — currently anyone can edit any patient.
2. Make `JWT_SECRET` **throw on missing** in production (remove the weak fallback).
3. Move the auth token to an **HttpOnly, Secure** cookie set by the server, not `document.cookie`.
4. Derive `accessorId` from the verified JWT in `emergency/access` instead of trusting the request body.
5. Rename the two malformed route folders (`[medicationId]`, `[messageId]`) so those endpoints actually work.

### 🟡 Should fix

6. Write a real **README**: purpose, features, setup (`cp .env.example .env`, `prisma migrate`, `db:seed`), env vars, demo logins (the seed has `maria@test.com` / `password123`, etc.), screenshots.
7. Add a **LICENSE** file.
8. Add **`.env.example`** documenting `DATABASE_URL` and `JWT_SECRET`.
9. Delete `schema.sqlite.prisma` and the SQLite workaround in `emergency/search`; use Prisma `mode: 'insensitive'`.
10. Remove unused deps (`z-ai-web-dev-sdk`, `next-auth`, `next-intl`, `@vercel/postgres`) — or actually wire the LLM SDK into the `/api/ai/*` routes to make them genuinely AI-powered.
11. Add **rate limiting** (e.g. `@upstash/ratelimit`) to auth and break-glass endpoints.

### 🟢 Nice-to-have

12. Add **tests** (Vitest/Jest) for the rule-based AI engines and auth middleware — these are pure functions, easy to test.
13. Add **CI** (GitHub Actions: lint + typecheck + build).
14. Convert the Zustand page-switching to **Next.js routing** to get URLs, deep-linking, SSR, and better SEO for the landing page.
15. Make the war-room **real-time** with Server-Sent Events or WebSockets.
16. Split the giant patient-include query (25+ relations) into targeted fetches to avoid over-fetching.
17. Add **HIPAA/GDPR notes** to the README — for a medical app, documenting compliance posture (even if "not production-ready / demo only") is important.

---

## 10. TL;DR

MemoryVaulto is an **ambitious, well-modeled emergency medical records vault** built on a modern Next.js 16 + Prisma + TypeScript + shadcn/ui stack (~22k LOC, ~30 DB models, ~75 API routes). Its clinical domain modeling is genuinely thoughtful and the security *framework* (JWT, RBAC, audit logging, break-glass notifications, security headers) is more mature than typical hackathon projects.

However, it is **held back by**:

- An empty README
- No license
- No tests/CI
- A few real security holes (unauthenticated patient-update endpoint, JS-accessible auth cookie, weak JWT-secret fallback)
- Two broken dynamic-route folders from typos
- Misleadingly-labeled "AI" features that are actually hardcoded rules

**Verdict:** With ~1 day of hardening + documentation it could be a genuinely impressive portfolio/demo project; in its current state it's a strong prototype that **shouldn't be deployed against real PHI**.
