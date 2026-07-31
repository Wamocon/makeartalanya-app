# Make Art Studio – Setup Guide

## Projekt: makeartalanya-app
Deployed to: **makeartalanya.com** (via Vercel)  
Supabase: **vnldsyjkhofofellwuiq** (makeartalanya)

---

## Phase 1 – Was bereits erledigt ist ✅

| # | Task | Status |
|---|------|--------|
| 1 | Next.js 16 Projekt erstellt (TypeScript, Tailwind v4, App Router) | ✅ |
| 2 | Supabase Libs installiert (`@supabase/supabase-js`, `@supabase/ssr`) | ✅ |
| 3 | `.env.local` mit Supabase-Daten konfiguriert | ✅ |
| 4 | Trilinguales Landing Page (TR/EN/RU) – 7 Sektionen | ✅ |
| 5 | Buchungsformular (Direktbuchung, alle 6 Pakete) | ✅ |
| 6 | Supabase Datenbankschema (Migration 0001) | ✅ |
| 7 | Vercel Setup-Skript (`setup-vercel.sh`) | ✅ |
| 8 | Build: ✅ Kompiliert ohne Fehler | ✅ |
| 9 | Dev-Server: HTTP 200 ✅ | ✅ |

---

## Was jetzt noch manuell nötig ist

### 1. Supabase CLI – Projekt linken

```bash
cd /Users/Studio-Standard/makeartalanya-app

# Login (öffnet Browser)
supabase login

# Projekt verlinken
supabase link --project-ref vnldsyjkhofofellwuiq

# Migration ausführen (Schema erstellen)
supabase db push
```

Alternativ: SQL direkt im Supabase Dashboard ausführen:  
`https://app.supabase.com/project/vnldsyjkhofofellwuiq/sql/new`  
→ Inhalt von `supabase/migrations/0001_initial_schema.sql` einfügen → Run

### 2. Vercel – Projekt deployen

**Option A: Automatisch via Skript**
```bash
# Token von: https://vercel.com/account/tokens → Create Token
VERCEL_TOKEN=dein_token bash setup-vercel.sh
```

**Option B: Manuell im Vercel Dashboard**
```
vercel.com → Project → Settings → Environment Variables:

NEXT_PUBLIC_SUPABASE_URL     = https://vnldsyjkhofofellwuiq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = (from Supabase dashboard → Settings → API → anon key)
NEXT_PUBLIC_SITE_URL         = https://makeartalanya.com
NEXT_PUBLIC_DEFAULT_LOCALE   = tr
SUPABASE_DB_PASSWORD         = (from Supabase dashboard → Settings → Database → password)
SUPABASE_SERVICE_ROLE_KEY    = (from Supabase dashboard → Settings → API → service_role key)
ADMIN_DASHBOARD_PASSWORD     = (choose a strong password)
ADMIN_SESSION_SECRET         = (at least 32 random bytes)
```

### 2a. AI concierge and KVKK transfer gate

The public assistant is enabled only when a model is configured and its data
transfer is allowed. Prefer a Türkiye-hosted `AI_API_URL`. For OpenRouter,
OpenAI, Anthropic or another overseas processor, keep
`CONCIERGE_ALLOW_EXTERNAL_PROVIDER=false` until the applicable KVKK Article 9
transfer mechanism (such as the correct standard contract and notification)
has been completed and the privacy notice has been confirmed by counsel.
Local development still shows the assistant behind its provider-specific
consent screen so the complete UI and guardrails can be tested. The production
build continues to require the explicit flag above for an overseas provider.

The chat API accepts text only, blocks common identifiers/contact details,
limits context and output, has no tools or database access, and is restricted
to Make Art Studio information.

### 2b. Mandatory business/legal launch data

Set the following from the trade registry/accountant before launch:

```text
NEXT_PUBLIC_COMPANY_MERSIS_NO
NEXT_PUBLIC_COMPANY_TRADE_REGISTRY_NO
NEXT_PUBLIC_COMPANY_DIRECTOR
```

If the website will allow a binding order or payment, complete ETBİS
registration before that functionality goes live. The current forms are
explicitly non-binding requests and do not take payment.

Apply every Supabase migration through `0019_kvkk_notice_terms_health.sql`
before deploying the matching application code.

Public package and service tariffs must use Turkish lira (`TL` / `₺`). The old
euro figures are intentionally no longer published. Add only the studio's
approved, tax-inclusive TL tariff after it has been confirmed by the business
and accounting adviser.

### 3. GitHub Repo erstellen + mit Vercel verbinden

```bash
cd /Users/Studio-Standard/makeartalanya-app
git remote add origin https://github.com/Wamocon/makeartalanya-app.git
git push -u origin main
```
→ Vercel: Import Git Repository → makeartalanya-app → Deploy

### 4. Custom Domain verbinden (nach DNS Propagation ~24h)

```
Vercel → Project → Settings → Domains → Add Domain
→ makeartalanya.com
→ DNS bei Strato: CNAME www → cname.vercel-dns.com
          oder A  @ → 76.76.21.21
```

---

## Nächste Entwicklungsschritte (Phase 2)

- [ ] `/api/booking` Route – Buchungsanfrage in Supabase speichern + E-Mail Benachrichtigung
- [ ] Admin-Dashboard (`/admin`) – Buchungen verwalten, Anwesenheit eintragen
- [ ] Echte Galeriebilder in Supabase Storage hochladen
- [ ] Google Maps Embed (nach Adressbestätigung)
- [ ] Legal-Seiten: `/privacy`, `/imprint` (Texte vom Kunden)
- [ ] SEO: sitemap.xml, robots.txt, OG-Images

---

## Projektstruktur

```
makeartalanya-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          – SEO metadata (TR/EN/RU)
│   │   ├── page.tsx            – Landing Page root
│   │   └── globals.css         – Brand colors (#DCA8B2, #A9C7E5)
│   ├── components/sections/
│   │   ├── Navbar.tsx          – Sticky nav + 3-lang switcher
│   │   ├── Hero.tsx            – Hero mit CTA
│   │   ├── ProblemSection.tsx  – Warum Make Art Studio
│   │   ├── PackagesSection.tsx – 6 Pakete (1/2/4/8/12/16 Std.)
│   │   ├── GallerySection.tsx  – Galerie (Placeholder → Supabase Storage)
│   │   ├── BookingSection.tsx  – Buchungsformular
│   │   ├── AboutSection.tsx    – Über die Lehrerin
│   │   ├── LocationSection.tsx – Adresse + Karte
│   │   └── Footer.tsx          – Legal + Social
│   ├── i18n/translations.ts    – TR/EN/RU Übersetzungen + Paketpreise
│   └── lib/supabase/
│       ├── client.ts           – Browser Client
│       └── server.ts           – Server Client (RSC)
├── supabase/migrations/
│   └── 0001_initial_schema.sql – DB Schema (profiles, packages, subscriptions, bookings, attendance)
├── .env.local                  – Supabase Credentials
├── setup-vercel.sh             – Automatisches Env Var Setup
└── SETUP.md                    – Diese Datei
```
