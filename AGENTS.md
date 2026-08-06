<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Make Art Studio Alanya (`makeartalanya-app`)

> AI-agent onboarding file for the Make Art Studio Alanya web application.  
> Everything below is based on the actual files in this repository. Do not assume a generic Next.js / Supabase setup.

---

## 1. Project overview

This is the public website, student portal and admin dashboard for **Make Art Studio Alanya** (live domain: `makeartalanya.com`).

It is a **Next.js 16 App Router** application that talks to **Supabase** (Auth + PostgreSQL + Storage + Realtime). The public landing page is trilingual (Turkish, English, Russian). The protected `/my/*` area is for students/parents, and `/admin/*` is the studio management dashboard.

Key project docs:

- `README.md` — generic Next.js bootstrapping notes (mostly template text).
- `SETUP.md` — German-language deployment/setup checklist for Vercel + Supabase.
- `IMPLEMENTATION_PLAN.md` — large English architecture/spec document that describes the *target* design. The running code may be slightly ahead or behind that plan.

---

## 2. Tech stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | **Next.js 16.2.6** | App Router, React Server Components, Server Actions, Route Handlers. |
| Runtime | **React 19.2.4** | Uses modern hooks (`useActionState`, `useOptimistic`, `use()` where applicable). |
| Language | **TypeScript 5** | Strict mode enabled in `tsconfig.json`. |
| Styling | **Tailwind CSS v4** | Configured via `postcss.config.mjs` with `@tailwindcss/postcss`. Design tokens live in `src/app/globals.css` using `@theme inline` and CSS custom properties. |
| Fonts | `next/font/google` | Inter (sans) + Playfair Display (display), Latin + Cyrillic subsets. |
| Animation | **Framer Motion** + **GSAP** | GSAP scroll animations are wired through `src/hooks/useGsapAnimations.ts`. |
| 3D / landing | **Three.js + React Three Fiber** | Used on the login page (`src/components/three/LoginScene.tsx`). |
| Icons | **Lucide React** | |
| Validation | **Zod** (v4 in `package.json`) | Shared schemas in `src/lib/schemas.ts`. |
| Auth | **Supabase Auth** via `@supabase/ssr` 0.10.3 | Phone OTP + email/password + magic links. Browser/server/middleware clients in `src/lib/supabase/`. |
| Database | **Supabase PostgreSQL** | Migrations in `supabase/migrations/`. Row Level Security (RLS) is required. |
| Realtime | **Supabase Realtime** | Currently enabled for the `notifications` table. |
| Storage | **Supabase Storage** | Buckets: `gallery` (50 MB, images + mp4/webm), `instructor`, `content`. Uploads go direct from the browser on signed URLs. |
| Drag & drop | **dnd-kit** (`core` 6.3.1, `sortable` 10.0.0) | Gallery ordering in `/admin/media`. Chosen over native HTML5 DnD for keyboard sorting and screen-reader announcements. |
| Notifications | **Nodemailer** (SMTP) + **Telegram Bot API** | `src/lib/notifications/`. |
| E2E tests | **Playwright** 1.60 | Config in `playwright.config.ts`, tests in `e2e/tests/`. |
| Package manager | **npm** | `package-lock.json` is present. |

There is **no Vitest / Jest** configured yet despite mentions in `IMPLEMENTATION_PLAN.md`. The only automated test layer is Playwright.

---

## 3. Project structure

```
makeartalanya-app/
├── src/
│   ├── app/                  # Next.js App Router pages + API routes
│   │   ├── (public)          # /, /schedule, /privacy, /imprint, /sitemap.ts, /robots.ts
│   │   ├── auth/             # /auth/login, /auth/callback, /auth/forgot-password, ...
│   │   ├── my/               # Student/parent portal (protected)
│   │   ├── admin/            # Admin dashboard (protected)
│   │   ├── api/              # Route handlers
│   │   ├── layout.tsx        # Root layout with fonts + SEO metadata
│   │   ├── page.tsx          # Landing page (client component, trilingual)
│   │   └── globals.css       # Tailwind v4 + brand tokens
│   ├── components/
│   │   ├── sections/         # Landing-page sections (Hero, Packages, Booking, ...)
│   │   ├── admin/            # AdminSidebar, AdminLocaleProvider, ...
│   │   ├── layout/           # ClientNav, ClientSidebar
│   │   ├── schedule/         # ScheduleView
│   │   ├── three/            # WebGL login scene
│   │   ├── GsapProvider.tsx
│   │   ├── JsonLd.tsx        # LocalBusiness schema
│   │   └── Logo.tsx
│   ├── hooks/
│   │   └── useGsapAnimations.ts
│   ├── i18n/
│   │   ├── translations.ts   # Landing-page translations (tr/en/ru)
│   │   ├── dashboard.ts      # Portal translations
│   │   ├── admin-translations.ts
│   │   └── server.ts         # `getLocale()` reads the `lang` cookie
│   ├── lib/
│   │   ├── supabase/         # Browser, server, admin, middleware clients
│   │   ├── notifications/    # email.ts + telegram.ts
│   │   ├── auth-guard.ts     # `requireAdmin()` helper
│   │   ├── rate-limit.ts     # In-memory API rate limiter
│   │   ├── result.ts         # Type-safe Result<T> helper
│   │   └── schemas.ts        # Zod schemas
│   └── proxy.ts              # Next.js 16 auth gate (replaces middleware.ts)
├── supabase/
│   ├── migrations/           # 0001–0007 numbered SQL migrations
│   ├── email-templates/      # Supabase Auth email templates
│   └── config.toml           # Supabase CLI local-dev config
├── e2e/
│   ├── fixtures.ts           # Custom Playwright fixtures + helpers
│   └── tests/                # ~18 spec files + visual-regression snapshots
├── public/                   # Static assets, images, logos
├── next.config.ts            # Next.js config + security headers
├── playwright.config.ts      # Playwright config
├── eslint.config.mjs         # ESLint 9 flat config (next/core-web-vitals + typescript)
├── postcss.config.mjs        # Tailwind v4 PostCSS plugin
├── tsconfig.json             # Strict TypeScript, path alias `@/*`
├── setup-vercel.sh           # Bash helper to push env vars to Vercel
└── .vercel/project.json      # Vercel project metadata
```

---

## 4. Build, dev and test commands

```bash
# Install dependencies
npm install

# Run local dev server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server (after build)
npm run start

# Lint
npm run lint

# Run the full Playwright suite
npm test

# Useful Playwright variants
npm run test:ui                # Interactive UI mode
npm run test:headed            # Headed browsers
npm run test:chromium          # Chromium only
npm run test:mobile            # Mobile projects
npm run test:api               # API specs only
npm run test:booking           # Booking flow specs
npm run test:admin             # Admin specs
npm run test:report            # Show HTML report
npm run test:update-snapshots  # Update visual-regression snapshots
```

`playwright.config.ts` automatically starts `npm run dev` as a web server, so `npm test` works against a fresh local dev instance.

---

## 5. Environment variables

The app expects a `.env.local` file. Required / commonly used variables:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Preferred public key. Falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` if missing. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Legacy public key (still accepted as fallback). |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side service role — required for admin API routes and dashboards. |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, e.g. `https://makeartalanya.com`. |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default language, e.g. `tr`. |
| `ADMIN_DASHBOARD_USER` | Legacy admin dashboard username. |
| `ADMIN_DASHBOARD_PASSWORD` | Legacy admin dashboard password. |
| `TELEGRAM_BOT_TOKEN` | For Telegram admin notifications. |
| `TELEGRAM_ADMIN_CHAT_ID` | Destination chat for admin alerts. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Nodemailer SMTP config (defaults to Strato). |
| `FROM_EMAIL` / `ADMIN_NOTIFICATION_EMAIL` | Email from/sender addresses. |

**Do not commit secrets.** The repository already contains `.env.local`; treat it as sensitive and do not expose its contents.

---

## 6. Authentication & authorization

- **Public routes** (`/`, `/schedule`, `/privacy`, `/imprint`, `/auth/*`, public API paths) are unprotected.
- **`/my/*`** requires a valid Supabase session.
- **`/admin/*`** uses a **hybrid** model:
  1. Supabase auth with `role = 'admin'` or `'trainer'` in the `profiles` table.
  2. A legacy `admin_session` HttpOnly cookie set by `POST /api/admin/login` using `ADMIN_DASHBOARD_USER` / `ADMIN_DASHBOARD_PASSWORD`.

The auth gate is `src/proxy.ts` (Next.js 16 replaces `middleware.ts`). It delegates Supabase session refresh to `src/lib/supabase/middleware.ts` and applies route-specific checks. `src/lib/auth-guard.ts` provides `requireAdmin()` for API routes and Server Actions.

Supabase clients:

- `src/lib/supabase/client.ts` — browser client.
- `src/lib/supabase/server.ts` — server client for RSC / Server Actions / Route Handlers.
- `src/lib/supabase/middleware.ts` — session refresh inside `proxy.ts`.
- `src/lib/supabase/admin.ts` — service-role client for admin dashboards.

---

## 7. Database & migrations

Database is Supabase PostgreSQL. Schema is managed by numbered migrations in `supabase/migrations/`:

1. `0001_initial_schema.sql` — base schema: `profiles`, `packages`, `subscriptions`, `bookings`, `attendance`, RLS.
2. `0002_fix_rls_recursion.sql` — adds `public.is_admin()` / `public.is_admin_or_trainer()` security-definer helpers.
3. `0003_storage_buckets.sql` — `gallery` + `instructor` storage buckets.
4. `0004_content_management.sql` — `site_content` editable text table.
5. `0005_full_studio_schema.sql` — major expansion: `children`, `class_types`, `schedule_templates`, `schedule_exceptions`, `class_sessions`, `enrollments`, `subscription_freezes`, `payments`, `waitlist`, `notifications`, `studio_settings`, `audit_log`, triggers.
6. `0006_sample_data.sql` — demo profiles, children, subscriptions, sessions, enrollments.
7. `0007_enable_realtime_notifications.sql` — enables realtime for `notifications`.

### Key database rules

- RLS is enabled on almost every table. Policies use `public.is_admin()` / `public.is_admin_or_trainer()` helpers to avoid recursion.
- Critical triggers:
  - `trg_enrolled_count` — keeps `class_sessions.enrolled_count` in sync with `enrollments`.
  - `trg_subscription_status` — auto-updates subscription status to `active`/`expired`/`exhausted`.
  - `trg_promote_waitlist` — offers a waitlist spot when an enrollment is cancelled/no-showed.
  - `fn_waitlist_auto_position` — assigns waitlist position on insert.
- `generate_sessions(weeks_ahead)` is a PostgreSQL function that creates concrete `class_sessions` rows from `schedule_templates`.

### Migration workflow

```bash
# Link to the live Supabase project
supabase link --project-ref vnldsyjkhofofellwuiq

# Push migrations
supabase db push
```

Alternatively, run the migration SQL directly in the Supabase Dashboard SQL editor.

---

## 8. API & server conventions

### Route handlers (`src/app/api/...`)

- `/api/booking` — public booking form submission, rate-limited, inserts into `bookings`, fires email/Telegram notifications.
- `/api/enroll` — public enrollment endpoint (rate-limited in `proxy.ts`).
- `/api/admin/*` — authenticated admin APIs (bookings, sessions, subscriptions, payments, settings, attendance, login/logout).
- `/api/gallery` — **public**, cached (`s-maxage=60`). The ordered gallery manifest. Read with the publishable key so RLS decides what is visible.
- `/api/admin/gallery` — `GET` all items incl. hidden, `POST` record uploaded items, `PATCH` bulk show/hide/delete.
- `/api/admin/gallery/[id]` — `PATCH` captions/alt/category/group/visibility, `DELETE` row + both storage objects.
- `/api/admin/gallery/reorder` — rewrites one category's `position` to 1..n from a full ordered id list.
- `/api/admin/gallery/upload-url` — issues a **pair** of signed direct-to-Storage upload URLs sharing one uuid stem (asset + thumbnail).
- `/api/admin/gallery/categories` — `GET` with counts, `POST` create (slug derived from the label, then immutable).
- `/api/admin/gallery/categories/[slug]` — `PATCH` label/visibility, `DELETE` with optional `moveTo` to relocate contents.
- `/api/admin/gallery/categories/reorder` — rewrites rail order from a full ordered slug list.
- `/api/admin/instructor-photo` — `GET` current, `POST` signed URL, `PUT` commit + sweep older objects.
- `/api/upload` — **unused legacy route.** Superseded by the signed-URL flow above; it streams file bodies through the function, which Vercel caps at ~4.5 MB. Retained only because `e2e/tests/api.spec.ts` asserts its auth. Do not build on it.
- `/api/content` — load/save JSON content overrides from Supabase Storage.
- `/api/seed` — seed helper (check the route for exact behavior).
- `/api/notifications` — notification-related API.
- `/auth/callback` — Supabase magic-link / OAuth callback exchange.

### Coding conventions

- Use `src/lib/result.ts` for Server Actions: return `{ success: true, data: T }` or `{ success: false, error, code }` instead of throwing.
- Validate incoming payloads with Zod schemas from `src/lib/schemas.ts`.
- Use `requireAdmin()` from `src/lib/auth-guard.ts` at the top of admin Route Handlers.
- Use `createAdminClient()` only where service-role access is required; otherwise use `createClient()` from `src/lib/supabase/server.ts`.
- The path alias `@/*` maps to `./src/*`.

---

## 9. UI / styling conventions

- Tailwind v4 with `@theme inline`. Custom theme keys are in `src/app/globals.css`.
- Brand palette: pink (`#E8A0B0` / `#DCA8B2`), blue (`#8CB8D9` / `#A9C7E5`), soft background `#faf8f7`, foreground `#1a1115`.
- Utility classes: `.section-badge`, `.glass`, `.mesh-gradient`, `.animate-float`, etc.
- Landing page is a client component (`src/app/page.tsx`) that reads locale from URL `?lang=`, cookie `lang`, then `localStorage`.
- Portal/admin areas are mostly server components; mobile layouts use bottom nav (`ClientNav`) while desktop uses sidebar (`ClientSidebar`).

---

## 10. Testing strategy

Only Playwright E2E tests are configured.

- Config: `playwright.config.ts`.
- Custom fixtures: `e2e/fixtures.ts` provides `homePage` and `adminPage` fixtures plus `fillBookingForm()` helper.
- Specs cover: homepage, sections, navigation, i18n, booking form, booking API, admin auth/dashboard, client portal, schedule, legal pages, visual regression, dynamic content, edge cases, performance/a11y/SEO.
- CI / local defaults:
  - Runs against `http://localhost:3000`.
  - Projects: chromium, firefox, webkit, mobile-chrome (Pixel 5), mobile-safari (iPhone 12).
  - `workers: 1` in CI, parallel locally.
  - Retries: 2 in CI, 0 locally.
  - Traces/screenshots/videos retained on failure.

### Running tests against a real environment

Set `BASE_URL` to point at a deployed preview or production instance:

```bash
BASE_URL=https://makeartalanya.com npx playwright test
```

When `BASE_URL` is set, the tests will **not** auto-start the local dev server.

---

## 11. Deployment

- **Primary host**: Vercel (`makeartalanya.com`).
- **Database**: Supabase project `makeartalanya` / ref `vnldsyjkhofofellwuiq`.
- `setup-vercel.sh` can push environment variables to Vercel using `VERCEL_TOKEN=xxx bash setup-vercel.sh`.
- `next.config.ts` adds standard security headers (HSTS, CTFO, XSS, CSP-like referrer/permissions headers).
- `src/proxy.ts` also appends security headers on every response.

Deployment checklist (from `SETUP.md`):

1. Link/push Supabase migrations (`supabase link`, `supabase db push`).
2. Configure all required environment variables in Vercel.
3. Connect the Git repository to Vercel for automatic deploys, or run `vercel --prod`.
4. Configure the custom domain `makeartalanya.com` in Vercel and DNS.

---

## 12. Security considerations

- **Secrets**: Never expose `SUPABASE_SERVICE_ROLE_KEY`, SMTP credentials, or admin passwords in the browser.
- **RLS**: All tables except `auth.users` use RLS. Always test policies with an authenticated Supabase client, not just service role.
- **Rate limiting**: `src/proxy.ts` and `src/lib/rate-limit.ts` implement simple in-memory rate limiting. This is fine for local dev / low traffic; at scale replace with Redis or a Vercel Edge rate limiter.
- **Admin auth**: The legacy `admin_session` cookie is Base64-encoded `username:timestamp`, valid for 8 hours. New admin features should prefer Supabase auth roles.
- **Input validation**: Use Zod on the server; never trust client payloads.
- **XSS / SQLi**: Existing Playwright tests include malicious payloads; the app uses parameterized Supabase queries, so raw SQL injection is not possible via the JS client.

---

## 13. Gotchas & agent notes

1. **Next.js 16 is non-standard**. APIs like `proxy.ts` may differ from older Next.js versions. Check the local docs in `node_modules/next/dist/docs/` if in doubt.
2. **`/admin` currently reads `bookings`**, but migration `0005_full_studio_schema.sql` renames the legacy `bookings` table to `legacy_bookings`. If the admin dashboard errors, check whether the `bookings` table still exists or whether the code needs to target the new `enrollments`/`class_sessions` model.
3. **No unit-test runner** — use Playwright for verification, or add Vitest/Jest if you want fast unit tests.
4. **i18n is custom**, not `next-intl`. The source of truth is the `lang` cookie; `src/i18n/server.ts` reads it server-side and the landing page reads URL/localStorage client-side.
5. **Schedule page uses ISR** (`export const revalidate = 60` in `src/app/schedule/page.tsx`). If you mutate schedule data, you may need explicit `revalidatePath` / `revalidateTag` until a realtime hook is added.
6. **Realtime** is enabled only for `notifications`. Client components like `RealtimeNotifications` subscribe to Supabase Realtime channels.
7. **Storage buckets** must exist before upload/content features work. Migration `0003_storage_buckets.sql` creates `gallery` and `instructor`; `content` is used by `/api/content` and the landing-page overrides. `0024` widens `gallery` to 50 MB and allows `video/mp4` + `video/webm`.
9. **The gallery is database-driven** (`gallery_items`, migration `0024`), managed at `/admin/media`. Two things to know before touching it:
   - **The pixels live in two places.** Rows with `storage_path = NULL` are the bundled archive under `public/gallery/`, served by the Vercel CDN and built by `scripts/build-gallery.mjs`. Rows with a `storage_path` were uploaded through the admin and live in Supabase Storage. Everything downstream treats them identically — that is deliberate, and it is why all 160 legacy photos are reorderable. Run `node scripts/import-gallery.mjs` (idempotent) if the manifest and the table drift.
   - **Uploads never pass through a route handler.** The browser downscales to WebP on a canvas (mirroring `build-gallery.mjs`: 1800px / 720px / 16px blur), then `PUT`s straight to Storage on a signed URL. Anything that routes file bytes through Next will break on Vercel's ~4.5 MB request-body cap. HEIC is rejected client-side with a fix-it message — neither browsers nor sharp can decode it.
10. **`media-src` is in the CSP** (`next.config.ts`). Without it `<video>` falls back to `default-src 'self'` and every Storage-hosted clip is blocked.
11. **Categories are rows, not code** (`gallery_categories`, migration `0027`). Two invariants worth not breaking:
    - **The slug is immutable.** It is derived once from the label (transliterating Turkish and Cyrillic — see `slugify`) and becomes a storage key prefix and a public identifier. The *label* is what gets renamed.
    - **`gallery_items.category` is a real FK with `ON DELETE RESTRICT`.** Deleting a non-empty category is refused with a 409; the admin passes `moveTo` to relocate its contents first. Never change this to `CASCADE` — it turns one click into forty deleted photos.
    All three locale labels are required, enforced by a `CHECK` constraint *and* by the admin form, because a missing Russian heading is a broken page for a third of this studio's families.
8. **Package versions matter** — `zod` is v4 in `package.json`, Tailwind is v4, React is 19, Next.js is 16. Do not downgrade or mix versions without checking compatibility.

---

_Last updated: 2026-06-17 based on repository contents._
