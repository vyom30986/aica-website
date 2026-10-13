# AICA website

The new aicaglobal.in: Next.js 15 + React Three Fiber (3D), Motion (page transitions), Tailwind v4, English + Hindi, with a built-in lead capture backend and a private `/admin` leads dashboard.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Locally, leads are saved to `.data/leads.json` (git-ignored). Set `ADMIN_PASSWORD` in `.env.local` to open `/admin`.

## Where things live

| What | File |
|---|---|
| Company facts, contact, team, pricing, prototype links | `src/lib/site.ts` |
| All English copy | `src/content/dict/en.ts` |
| All Hindi copy | `src/content/dict/hi.ts` |
| Blog posts (Markdown) + their titles/dates | `content/blog/*.md` + `src/lib/blog.ts` |
| Privacy / Terms / Delete-account text | `content/legal/*.md` |
| 3D scene | `src/components/three/TridentScene.tsx` |
| Page transitions | `src/components/motion/Transition.tsx` |
| Lead form | `src/components/forms/LeadForm.tsx` |
| Lead API, storage, email alerts | `src/app/api/leads/route.ts`, `src/lib/leads.ts`, `src/lib/notify.ts` |
| Leads dashboard | `src/app/admin/` |

## Go live (free tier)

1. **Push to GitHub** (private repo).
2. **Vercel** → *Add New Project* → import the repo. Framework: Next.js (auto).
3. **Database**: in the Vercel project → *Storage* → *Create* → **Neon (Postgres)** → connect. This sets `DATABASE_URL` automatically. The `leads` table is created on the first submission.
4. **Email alerts**: create a free account at resend.com → API key → add `RESEND_API_KEY` and `LEAD_NOTIFY_TO` in Vercel → *Settings* → *Environment Variables*. (Until you verify your domain in Resend, alerts can only go to the email you signed up with.)
5. Add `ADMIN_PASSWORD` (long and random) and `NEXT_PUBLIC_SITE_URL=https://aicaglobal.in`. See `.env.example` for the rest.
6. **Prototypes**: the old demos live on the DigitalOcean server. Before moving the domain, point a subdomain (e.g. `demo.aicaglobal.in`) at that server and set `NEXT_PUBLIC_DEMO_URL=https://demo.aicaglobal.in/demo`.
7. **Domain**: Vercel → *Settings* → *Domains* → add `aicaglobal.in` and `www.aicaglobal.in`, then update the DNS records at GoDaddy as Vercel shows.
8. Submit a test lead, check it appears in `/admin` and that the alert email arrives.

## Before launch — confirm these (marked `TODO` in code)

- `src/lib/site.ts`: CIN, a named Grievance Officer, court jurisdiction, team names/photos/roles, Patient Pro price, domain email.
- `content/legal/*.md`: retention periods and 30-day response times are proposed defaults — have your lawyer review.
- `src/content/dict/hi.ts`: have a native speaker review the Hindi.
- Contact hours on the Contact page (`contact.hours` in both dictionaries).
