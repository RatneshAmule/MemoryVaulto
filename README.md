<div align="center">

# 🧠 MemoryVault

### Emergency Medical Identity Vault

**_"When you can't speak, your vault does."_**

Giving hospitals & first responders instant access to a patient's critical medical history during emergencies — in 5 seconds, not 45 minutes.

</div>

---

## 📖 Overview

**MemoryVaulto** is a healthcare web application that acts as a digital memory vault for a patient's critical medical history. When a patient is unconscious, confused, or unable to communicate during an emergency, MemoryVaulto allows authorized hospital staff and first responders to instantly retrieve life-saving information — allergies, medications, conditions, implants, advance directives, and more.

> ⚠️ **Disclaimer:** This is a **demo / portfolio project**, not a certified medical device or HIPAA-compliant system. Do **not** use it with real patient data.

---

## 🚨 The Problem

In emergencies, critical information gaps cost lives:

- ⏱️ Hospital staff spend **30–45 minutes** tracking down a patient's medical history
- 💊 Unaware of allergies → preventable adverse drug reactions
- 🚫 Unknown DNR / advance directives → unwanted procedures
- 🩸 Unknown blood type / antibodies → transfusion risks
- 🧬 Unknown pharmacogenomic flags → anesthesia complications
- 🌍 Unknown cultural / religious directives → disrespectful care

## 💡 The Solution

A secure, consent-driven vault that:

1. Stores **30+ categories** of critical medical data per patient
2. Allows **break-glass emergency access** with full audit logging
3. **Notifies the patient** (or proxy) the moment their vault is accessed
4. Provides **clinical decision support** for triage, drug interactions, red flags
5. Powers a **family war room** for real-time updates during hospitalization

---

## ✨ Key Features

### 🏥 Patient Vault
- Allergies & adverse reactions
- Medications & adherence tracking
- Conditions (ICD-11 coded)
- Surgeries & implants (with MRI-safety flags)
- Vaccinations
- Emergency contacts & consent proxies
- Advance directives (DNR, DNI, living will)
- Cultural / religious directives
- **Voice messages** — "the voice of the patient" played before procedures
- Pharmacogenomic profile
- Genetic anesthesia flags (Malignant Hyperthermia, G6PD deficiency, Pseudocholinesterase deficiency)
- Pain & opioid tolerance profile
- Vital baselines & blood antibodies
- Device integrations (CGM, pacemaker, insulin pump)
- Occupational & radiation exposure tracking
- Caregiver access passes
- Medical timeline

### 🚪 Emergency Portal
- Break-glass access with **24h expiry**
- Automatic **audit logging** of every access
- **Patient notification** on every break-glass event
- Patient search by name / blood type / ID

### 🏨 Hospital Dashboard
- Access logs & audit trails
- Organ-match engine
- Outbreak radar (syndromic surveillance)

### 🤖 Clinical Decision Support
- Triage protocol suggestions
- Red-flag detection (severe allergies, anticoagulants, sepsis markers)
- Risk scoring
- Differential diagnosis hints
- Drug-interaction checker
- Pediatric dosing calculator
- Surgery safety checklist
- Discharge readiness scoring
- Treatment firewall (allergy-aware prescribing)
- Medication reconciliation
- Auto-generated clinical notes (SOAP format)

### 👨‍👩‍👧 Family War Room
- Real-time status updates for families
- Messaging during a patient's hospitalization
- Updates from care team

### 📊 Additional
- Polished landing page
- Demo mode with mock patients
- Analytics dashboard
- AI Lab for experimentation

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.1 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 19 + Tailwind CSS v4 + shadcn/ui (44 components) + Radix UI |
| **Animations** | Framer Motion |
| **State** | Zustand + TanStack Query |
| **Forms** | react-hook-form + Zod |
| **Database** | PostgreSQL + Prisma 6 ORM |
| **Auth** | JWT + bcrypt (12 rounds), custom middleware |
| **Charts** | Recharts |
| **Icons** | lucide-react |

---

## 📁 Project Structure

```
MemoryVaulto/
├── prisma/
│   ├── schema.prisma          ← 30+ models (PostgreSQL)
│   └── seed.ts                ← Demo patients & data
├── public/
│   └── logo.svg, favicon.svg, og-image.png
└── src/
    ├── middleware.ts          ← JWT auth + security headers
    ├── app/
    │   ├── page.tsx           ← Client-side page router
    │   └── api/               ← ~75 REST routes
    │       ├── auth/{login,register}
    │       ├── patients/[id]/  ← 20+ sub-resources
    │       ├── emergency/[patientId]/{access,route,status}
    │       ├── hospital/{dashboard,access-logs,organ-matches,outbreaks}
    │       ├── ai/{triage,red-flags,risk-score,...}
    │       └── war-room/
    ├── components/            ← ~15,500 LOC
    │   ├── ui/                ← shadcn primitives
    │   ├── landing/, auth/, patient/, emergency/
    │   ├── hospital/, war-room/, ai-lab/, analytics/
    │   └── demo/, vault/
    ├── stores/app-store.ts    ← Zustand global store
    ├── lib/                   ← db, jwt, auth-middleware, validation, utils
    └── hooks/                 ← use-mobile, use-toast
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.18
- **PostgreSQL** ≥ 14 (or use Docker)
- npm / pnpm / yarn

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/RatneshAmule/MemoryVaulto.git
cd MemoryVaulto

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. Seed demo data
npx prisma db seed

# 6. Start the dev server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Environment Variables

Create a `.env` file (see `.env.example`):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/memoryvaulto?schema=public"
JWT_SECRET="your-super-strong-secret-here-at-least-32-chars"
```

---

## 👤 Demo Accounts

The seed script (`prisma/seed.ts`) creates several demo patients and staff:

| Role | Email | Password |
|------|-------|----------|
| Patient | `maria@test.com` | `password123` |
| Patient | `james@test.com` | `password123` |
| Doctor | `dr.smith@hospital.com` | `password123` |
| Nurse | `nurse.kim@hospital.com` | `password123` |
| Admin | `admin@hospital.com` | `password123` |

> Change these in production!

---

## 🔌 API Overview

All API routes live under `/api/*` and are protected by JWT auth (except `/api/auth/login` and `/api/auth/register`).

### Auth
- `POST /api/auth/register` — create a new account
- `POST /api/auth/login` — login & receive JWT

### Patient Vault
- `GET /api/patients/:id` — full patient record (25+ relations)
- `PUT /api/patients/:id` — update patient
- `GET/POST/PUT/DELETE /api/patients/:id/{allergies,medications,conditions,...}` — sub-resources

### Emergency
- `POST /api/emergency/:patientId/access` — break-glass access
- `GET /api/emergency/search?q=...` — patient search
- `POST /api/emergency/:patientId/notify` — notify patient/proxy

### Hospital
- `GET /api/hospital/dashboard` — aggregate metrics
- `GET /api/hospital/access-logs` — audit trail
- `GET /api/hospital/organ-matches` — organ match candidates
- `GET /api/hospital/outbreaks` — syndromic surveillance

### AI / Clinical Decision Support
- `POST /api/ai/triage`
- `POST /api/ai/red-flags`
- `POST /api/ai/risk-score`
- `POST /api/ai/differential-diagnosis`
- `POST /api/ai/medication-reconciliation`
- `POST /api/ai/pediatric-dosing`
- `POST /api/ai/surgery-checklist`
- `POST /api/ai/discharge-assessment`
- `POST /api/ai/treatment-firewall`
- `POST /api/ai/clinical-notes`

### War Room
- `GET /api/war-room/:patientId` — status & messages
- `POST /api/war-room/:patientId/messages` — post update

---

## 🔐 Security

- ✅ bcrypt password hashing (12 rounds)
- ✅ JWT auth with 8h expiry
- ✅ Role-based access control (patient / doctor / nurse / specialist / admin)
- ✅ Per-route authorization (patients only see their own records)
- ✅ Security headers (CSP, X-Frame-Options DENY, nosniff, Permissions-Policy)
- ✅ Break-glass audit logging with patient notification
- ✅ Prisma ORM (SQL-injection-safe parameterized queries)

> 🚧 **Not yet production-hardened.** See [Security Roadmap](#-roadmap) below.

---

## 🗺️ Roadmap

### Phase 1 — Hardening (in progress)
- [ ] HttpOnly + Secure auth cookies
- [ ] Rate limiting on auth & break-glass endpoints
- [ ] End-to-end authorization on all patient PUT/DELETE routes
- [ ] Throw on missing JWT_SECRET in production
- [ ] Real-time war room (WebSocket / SSE)

### Phase 2 — Compliance
- [ ] HIPAA risk assessment
- [ ] Audit log immutability (append-only / hash chain)
- [ ] Data encryption at rest (column-level for PHI fields)
- [ ] BAA-ready documentation

### Phase 3 — Real AI
- [ ] Wire LLM SDK into `/api/ai/*` routes (currently rule-based)
- [ ] RAG over patient timeline for clinical summarization
- [ ] Multilingual voice messages

### Phase 4 — Interoperability
- [ ] HL7 FHIR R4 export/import
- [ ] SMART on FHIR app launch
- [ ] IHE PIX/PDQ patient matching

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

Please run `npm run lint` and `npm run build` before submitting.

---

## 📜 License

This project is currently **not licensed** — all rights reserved.

If you'd like to use it, please contact the author. (MIT or Apache-2.0 may be added in the future.)

---

## ⚠️ Medical Disclaimer

This software is provided for **demonstration and educational purposes only**. It is **not** a medical device, is **not** HIPAA-compliant, and is **not** intended for use with real patient data. The authors assume no liability for any use of this software.

---

## 👨‍💻 Author

**RatneshAmule** — [GitHub](https://github.com/RatneshAmule)

> Built with the goal that **no one should die because a hospital didn't know their medical history.**

---

<div align="center">

**⭐ If this project resonates with you, please star the repo.**

</div>
