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
NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_s5Bwenh9Hb7egmyahBswLg_1Qdw8uWe
NEXT_PUBLIC_SITE_URL         = https://makeartalanya.com
NEXT_PUBLIC_DEFAULT_LOCALE   = tr
SUPABASE_DB_PASSWORD         = ***REMOVED***  (nur Production)
```

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
