🏥 MemoryVaulto — Emergency Medical Identity Vault
Tagline: "When you can't speak, your vault does."

An ambitious healthcare web app that gives hospitals/first responders instant access to a patient's critical medical history during emergencies — when the patient is unconscious or unable to communicate.

🧰 Tech Stack
Layer
Tech
Framework	Next.js 16.1 (App Router)
Language	TypeScript 5
UI	React 19 + Tailwind v4 + shadcn/ui (44 components) + Framer Motion
State	Zustand + TanStack Query
DB	Prisma 6 + PostgreSQL (~30 models)
Auth	JWT + bcrypt (12 rounds), custom middleware
Charts	Recharts

Scale: ~21,900 LOC, ~75 API routes, 30 DB models.

✨ Key Features
Patient Vault — allergies, meds, conditions (ICD-11), surgeries, implants (MRI-safety), vaccinations, advance directives, cultural/religious directives, pharmacogenomics, genetic anesthesia flags (malignant hyperthermia, G6PD), pain/opioid profile, device integrations (CGM, pacemaker), radiation exposure, voice messages
Emergency Portal — break-glass access with audit logging + auto patient notifications
Hospital Dashboard — access logs, organ-match engine, outbreak radar
"AI" Clinical Decision Support — triage, red-flags, risk scoring, differential dx, drug-interaction checker, pediatric dosing, surgery checklist
Family War Room — status updates + messaging during hospitalization
Demo mode, analytics, AI lab pages
✅ Strengths
Clinically literate domain modeling — the Prisma schema is genuinely detailed (pharmacogenomics, cultural directives, radiation dose tracking — rare even in real EMRs)
Bleeding-edge stack — Next.js 16, React 19, Tailwind v4, Prisma 6
Security framework is more mature than typical hackathon work — RBAC middleware, security headers (CSP, X-Frame-Options), break-glass audit + patient notification, bcrypt 12 rounds
Well-typed — Zod validation, TS interfaces mirroring Prisma models
Consistent structure — RESTful nested routes, shadcn/ui throughout
🔴 Critical Issues
Security holes
PUT /api/patients/[id] has NO authorization check — any authenticated user can overwrite any patient's blood type, DNR, organ-donor status. Serious clinical-safety bug.
JWT secret has a weak hardcoded fallback ('change-me-in-production-use-strong-secret') — silently insecure if env var missing
Auth token stored in JS-accessible cookie (not HttpOnly) — XSS-stealable. The code comment even admits it should be HttpOnly.
emergency/access trusts accessorId from request body instead of JWT — spoofing risk
No rate limiting on login / break-glass endpoints
Bugs
Two broken route folders (typos — missing opening [):
…/medications/edicationId]/ → should be [medicationId]
…/voice-messages/essageId]/ → should be [messageId]
These PUT/DELETE endpoints silently never match a real URL — the routes are dead.
Hygiene
README is empty (just # MemoryVault)
No LICENSE file — all rights reserved by default
No .env.example, no tests, no CI
Unused deps: z-ai-web-dev-sdk, next-auth, next-intl, @vercel/postgres
Misleading "AI" labels — /api/ai/* routes are deterministic keyword-matching rules, not LLM calls (despite the LLM SDK being a dependency)
Duplicate schema.sqlite.prisma (527 lines of dead weight that will drift)
War-room is polling-based REST, not real-time (no WebSockets/SSE) despite the "real-time" implication
Commit history is minimal — looks like a one-shot dump, not iterative dev
📊 Overall Assessment
A genuinely ambitious and well-modeled prototype with thoughtful clinical domain design — far more sophisticated than typical hackathon projects. The 30-model schema and 75 API routes show real effort.

But it's not production-ready:

The unauthenticated patient-update endpoint is a clinical safety bug
Empty README + no license = hard for others to use/contribute
"AI" features are mislabeled rules
A few dead routes from typos
🚀 Recommendations (prioritized)
Must fix (1-2 days):

Add verifyPatientAccess() to PUT /api/patients/[id]
Throw on missing JWT_SECRET in production
Move auth cookie to HttpOnly + Secure (set server-side)
Derive accessorId from JWT, not request body
Rename the two broken [medicationId] / [messageId] route folders
Should fix:
6. Write a real README (setup, env vars, demo logins from seed.ts — e.g. maria@test.com / password123, screenshots)
7. Add LICENSE (MIT/Apache-2.0)
8. Add .env.example
9. Delete schema.sqlite.prisma + SQLite workaround, use Prisma mode: 'insensitive'
10. Either wire z-ai-web-dev-sdk into /api/ai/* (making them truly AI-powered) or remove the dep
11. Add rate limiting (@upstash/ratelimit) on auth + break-glass endpoints
12. Add HIPAA/GDPR disclaimer in README (even "demo only, not for real PHI")

Nice-to-have:
13. Tests (Vitest) for the rule engines + auth middleware
14. CI (GitHub Actions: lint + typecheck + build)
15. Migrate Zustand page-switching → real Next.js routing (URLs, deep-linking, SEO)
16. Make war-room real-time with SSE/WebSockets

