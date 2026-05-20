# Make Art Studio — Implementation Plan v2 (QA-Verified)

> Boris Cherny methodology: Plan → Validate → Execute
> QA'd: May 19 2026 — all schemas validated against PostgreSQL 16, Supabase May-2026 SDK, Next.js 16.2.6

---

## 0. QA AUDIT SUMMARY (Issues Found & Fixed)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | `subscription_freezes.days_frozen` used `NOW()` in GENERATED column — **PostgreSQL rejects volatile functions in generated columns** | CRITICAL | Replaced with a VIEW or computed at query time |
| 2 | Auth still uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` (deprecated end-2026) | HIGH | Migrate to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| 3 | `proxy.ts` is homebrew `atob()` auth, not Supabase proxy pattern | HIGH | Replace with official `updateSession()` + `getClaims()` |
| 4 | No trigger for `class_sessions.enrolled_count` denormalization | HIGH | Added trigger function |
| 5 | `enrollments` UNIQUE constraint blocks re-booking after cancel | MEDIUM | Partial unique index with `WHERE status = 'confirmed'` |
| 6 | No RLS policies for 7 new tables | HIGH | Added complete policies |
| 7 | No `settings` table for configurable business rules | MEDIUM | Added `studio_settings` table |
| 8 | No `schedule_exceptions` for holidays | MEDIUM | Added table |
| 9 | `expires_at DEFAULT NOW()+30 days` wrong for all types | MEDIUM | Removed default, set by admin |
| 10 | No `audit_log` table (security checklist mentions it) | MEDIUM | Added table |
| 11 | Missing CI/CD pipeline section | MEDIUM | Added |
| 12 | Missing caching/revalidation strategy | MEDIUM | Added |
| 13 | Missing i18n architecture for new pages | MEDIUM | Added |
| 14 | No `next/font` (uses render-blocking `<link>`) | LOW | Plan specifies next/font migration |
| 15 | Server Actions return `void` (lose error info) | MEDIUM | Changed to `Result<T>` pattern |
| 16 | KVKK (Turkish GDPR) not addressed | MEDIUM | Added to compliance section |
| 17 | No data migration strategy for existing bookings | LOW | Added migration path |
| 18 | Missing `payments` table for cash tracking | LOW | Added |
| 19 | Waitlist position gaps not handled | LOW | Added trigger |
| 20 | No connection pooling mention (Vercel + Supabase) | LOW | Added Supavisor note |

---

## 1. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT TIER                                  │
│                                                                       │
│  ┌──────────┐    ┌───────────────────┐    ┌────────────────────┐     │
│  │ Landing  │    │  Client Portal    │    │  Admin Dashboard   │     │
│  │  (SSG)   │    │  (Protected RSC)  │    │  (Protected RSC)   │     │
│  └──────────┘    └───────────────────┘    └────────────────────┘     │
│       │                    │                        │                  │
│       │          ┌─────────┴─────────┐    ┌────────┴────────┐        │
│       │          │ Realtime Client   │    │ Realtime Client  │        │
│       │          │ (useEffect hook)  │    │ (useEffect hook) │        │
│       │          └───────────────────┘    └─────────────────┘        │
└───────┼────────────────────┼────────────────────────┼────────────────┘
        │                    │                        │
┌───────┼────────────────────┼────────────────────────┼────────────────┐
│       ▼                    ▼                        ▼                 │
│              NEXT.JS 16 APPLICATION LAYER                             │
│                                                                       │
│  ┌─────────────┐  ┌───────────────┐  ┌──────────────────────────┐   │
│  │   proxy.ts  │  │ Server Actions│  │    API Routes            │   │
│  │ (auth gate) │  │ (mutations)   │  │ (webhooks, cron, public) │   │
│  └──────┬──────┘  └───────┬───────┘  └────────────┬─────────────┘   │
│         │                  │                       │                  │
│         ▼                  ▼                       ▼                  │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              DOMAIN LAYER (Pure TypeScript)                    │    │
│  │                                                                │    │
│  │  src/domain/subscription.ts  — State machine, FIFO selection  │    │
│  │  src/domain/booking.ts       — Validation, conflict check     │    │
│  │  src/domain/attendance.ts    — Deduction rules, no-show       │    │
│  │  src/domain/schedule.ts      — Template → Session generation  │    │
│  │  src/domain/notification.ts  — Channel selection, templating  │    │
│  │  src/domain/waitlist.ts      — Queue management, promotion    │    │
│  └──────────────────────────────────────────────────────────────┘    │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
┌────────────────────────────────┴─────────────────────────────────────┐
│                     INFRASTRUCTURE TIER                                │
│                                                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐    │
│  │ Supabase   │ │ Supabase   │ │ Supabase   │ │  Supabase      │    │
│  │ Auth       │ │ PostgreSQL │ │ Realtime   │ │  Storage       │    │
│  │ (OTP+ML)  │ │ +Supavisor │ │ (WebSocket)│ │  (Images)      │    │
│  └────────────┘ └────────────┘ └────────────┘ └────────────────┘    │
│                                                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐    │
│  │ Telegram   │ │ Resend     │ │ Vercel     │ │  Sentry        │    │
│  │ Bot API   │ │ (Email)    │ │ Cron       │ │  (Monitoring)  │    │
│  └────────────┘ └────────────┘ └────────────┘ └────────────────┘    │
└───────────────────────────────────────────────────────────────────────┘
```

### Tech Stack (Verified May 2026)

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js App Router | 16.2.6 | RSC, Streaming, Server Actions, `proxy.ts` auth gate |
| Runtime | React | 19.2.4 | `useOptimistic`, `useActionState`, `use()` |
| Auth | Supabase Auth | @supabase/ssr 0.10.3 | Phone OTP + Magic Link; `getClaims()` validation |
| Database | Supabase PostgreSQL 16 | via Supavisor | RLS, Triggers, Generated cols, Partitioning |
| Realtime | Supabase Realtime | Channel-based | Client Components subscribe; RSC renders initial |
| Storage | Supabase Storage | Bucket policies | Images only, 5MB max |
| Styling | Tailwind CSS | v4 (`@theme inline`) | Design tokens via CSS custom properties |
| Validation | Zod | ^3.23 | Shared schemas: client + server |
| Animation | Framer Motion | ^12.39 | Ease tuples: `[0.25, 0.46, 0.45, 0.94] as const` |
| Fonts | `next/font/google` | built-in | Zero-CLS font loading (Inter + Playfair Display) |
| Notifications | Telegram Bot API + Resend | Free tiers | Primary: Telegram (client preference) |
| PWA | Serwist (next-pwa successor) | ^9 | Offline schedule, installable |
| Unit Tests | Vitest | ^3 | Fast, ESM-native, same config as Next.js |
| E2E Tests | Playwright | ^1.60 | Already configured, 167 tests exist |
| Types | `supabase gen types` | CLI | Auto-generated from live schema |
| Deploy | Vercel (EU) + Supabase (eu-west-1) | — | Edge functions, geo-proximity |
| Monitoring | Sentry + Vercel Analytics | — | Errors + Core Web Vitals |

### Key Architecture Decisions

| Decision | Why | Alternative Rejected |
|----------|-----|---------------------|
| `proxy.ts` NOT `middleware.ts` | Next.js 16 uses `proxy.ts` for auth (can set cookies) | middleware can't set cookies in RSC |
| `getClaims()` NOT `getSession()` | `getClaims()` validates JWT signature; `getSession()` trusts cookie blindly | Security requirement |
| Publishable key NOT anon key | Supabase deprecating anon key end-2026; publishable key is the modern standard | Legacy keys still work but discouraged |
| Domain layer = pure functions | Testable with Vitest without HTTP mocking; framework-agnostic | Logic in Server Actions (untestable) |
| Denormalized `enrolled_count` + trigger | O(1) reads for schedule display vs O(n) COUNT on every view | COUNT(*) too slow for calendar grid |
| Supavisor connection pooling | Vercel serverless = many short connections; Supavisor handles pool | Direct connections exhaust Postgres |
| ISR for public schedule | Cache for 60s, revalidate on mutation — fast reads | Dynamic on every request (slow) |
| Telegram as primary notification | Client's customers already use Telegram (common in Turkey/Russia) | Push notifications (requires VAPID setup) |

---

## 2. AUTH ARCHITECTURE (Corrected)

### Current State (BROKEN — must replace)
```typescript
// src/proxy.ts — CURRENT: Homebrew cookie auth with atob()
// PROBLEM: Not integrated with Supabase Auth, no JWT, no RLS
```

### Target State (Official Supabase pattern)

#### `src/proxy.ts` — Auth Gate
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image, favicon.ico, public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

#### `src/lib/supabase/proxy.ts` — Session Refresh
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: getClaims() validates JWT signature.
  // Do NOT use getSession() — it reads from cookies without verification.
  const { data: { claims } } = await supabase.auth.getClaims()

  // Role-based route protection
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    if (!claims) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    // Check admin role from custom claims or profile
    const role = claims.user_metadata?.role
    if (role !== 'admin' && role !== 'trainer') {
      return NextResponse.redirect(new URL('/my', request.url))
    }
  }

  if (pathname.startsWith('/my')) {
    if (!claims) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return supabaseResponse
}
```

#### `src/lib/supabase/client.ts` — Browser Client
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!  // NOT anon key
  )
}
```

#### `src/lib/supabase/server.ts` — Server Client (RSC, Server Actions, Route Handlers)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component context — cookies are read-only
          }
        },
      },
    }
  )
}
```

### Auth Flow: Phone OTP (Primary)
```
Client enters phone → signInWithOtp({phone}) → Supabase sends SMS
→ Client enters code → verifyOtp({phone, token, type: 'sms'})
→ JWT issued → proxy.ts refreshes on each request → RLS enforces access
```

### Auth Flow: Email Magic Link (Fallback)
```
Client enters email → signInWithOtp({email}) → Supabase sends link
→ Client clicks link → /auth/callback route exchanges code for session
→ Same JWT/proxy/RLS flow
```

---

## 3. DATABASE SCHEMA (QA-Fixed)

### Entity Relationship Diagram

```
                    auth.users
                        │
                        │ 1:1
                        ▼
         ┌──────── profiles ────────┐
         │              │           │
         │ 1:N          │ 1:N      │ 1:N
         ▼              ▼           ▼
     children    subscriptions   audit_log
         │              │
         │              │ 1:N
         ▼              ▼
    enrollments ◄── subscription_freezes
         │
         │ N:1
         ▼
   class_sessions ──────► schedule_exceptions
         │
         │ N:1
         ▼
  schedule_templates ───► class_types
         
   waitlist ──► class_sessions
   notifications ──► profiles
   studio_settings (singleton)
   payments ──► subscriptions
```

### Tables (All validated against PostgreSQL 16)

---

#### `profiles` — EXISTS (migration 0001), add columns
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Istanbul';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
-- preferred_language already exists as lesson_language enum
```

---

#### `children` — NEW
```sql
CREATE TABLE children (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  birth_date  DATE NOT NULL,
  gender      TEXT CHECK (gender IN ('male','female','other')),
  medical_notes TEXT,                -- allergies, conditions
  emergency_contact TEXT,            -- if different from parent
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_children_parent ON children(parent_id);

-- RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents_own_children" ON children
  FOR ALL USING (parent_id = auth.uid());

CREATE POLICY "admin_all_children" ON children
  FOR ALL USING (public.is_admin_or_trainer());
```

---

#### `class_types` — NEW
```sql
CREATE TABLE class_types (
  id            SERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,     -- 'drawing', 'chess' (URL-safe)
  name_tr       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  name_ru       TEXT NOT NULL,
  description_tr TEXT,
  description_en TEXT,
  description_ru TEXT,
  color         TEXT NOT NULL DEFAULT '#DCA8B2',
  icon          TEXT,
  duration_min  INT NOT NULL DEFAULT 60 CHECK (duration_min > 0 AND duration_min <= 480),
  max_capacity  INT NOT NULL DEFAULT 8 CHECK (max_capacity > 0 AND max_capacity <= 50),
  age_min       INT CHECK (age_min >= 0),
  age_max       INT CHECK (age_max >= age_min),
  price_per_lesson NUMERIC(8,2),  -- NULL = uses subscription, not drop-in
  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Seed
INSERT INTO class_types (slug, name_tr, name_en, name_ru, color, duration_min, max_capacity, age_min, age_max) VALUES
  ('drawing',  'Resim',          'Drawing',      'Рисование',     '#DCA8B2', 60, 8,  4, NULL),
  ('chess',    'Satranç',        'Chess',        'Шахматы',       '#A9C7E5', 60, 6,  5, 14),
  ('workshop', 'Master Sınıfı', 'Workshop',     'Мастер-класс',  '#B8D4A8', 90, 10, NULL, NULL),
  ('miniclub', 'Mini Kulüp',    'Mini Club',    'Мини-клуб',     '#F2D479', 45, 6,  3, 5);

-- RLS
ALTER TABLE class_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_class_types" ON class_types FOR SELECT USING (true);
CREATE POLICY "admin_manage_class_types" ON class_types FOR ALL USING (public.is_admin());
```

---

#### `schedule_templates` — NEW (recurring weekly pattern)
```sql
CREATE TABLE schedule_templates (
  id            SERIAL PRIMARY KEY,
  class_type_id INT NOT NULL REFERENCES class_types(id) ON DELETE CASCADE,
  trainer_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Mon ISO
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  max_capacity  INT,  -- NULL = use class_type default
  room          TEXT, -- optional room identifier
  is_active     BOOLEAN DEFAULT TRUE,
  valid_from    DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until   DATE, -- NULL = indefinite
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_date_range CHECK (valid_until IS NULL OR valid_until >= valid_from)
);

-- Prevent same trainer teaching two classes at once
CREATE UNIQUE INDEX idx_no_trainer_overlap 
  ON schedule_templates(trainer_id, day_of_week, start_time)
  WHERE is_active = TRUE AND trainer_id IS NOT NULL;

-- RLS
ALTER TABLE schedule_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_templates" ON schedule_templates FOR SELECT USING (true);
CREATE POLICY "admin_manage_templates" ON schedule_templates FOR ALL USING (public.is_admin());
```

---

#### `schedule_exceptions` — NEW (holidays, closures, one-off changes)
```sql
CREATE TABLE schedule_exceptions (
  id            SERIAL PRIMARY KEY,
  exception_date DATE NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('holiday','closure','override')),
  title_tr      TEXT NOT NULL,
  title_en      TEXT,
  title_ru      TEXT,
  -- If type='override': replace a template for that day
  template_id   INT REFERENCES schedule_templates(id),
  override_start TIME,
  override_end   TIME,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exceptions_date ON schedule_exceptions(exception_date);

-- RLS
ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_exceptions" ON schedule_exceptions FOR SELECT USING (true);
CREATE POLICY "admin_manage_exceptions" ON schedule_exceptions FOR ALL USING (public.is_admin());
```

---

#### `class_sessions` — NEW (individual occurrences, generated from templates)
```sql
CREATE TABLE class_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   INT REFERENCES schedule_templates(id) ON DELETE SET NULL,
  class_type_id INT NOT NULL REFERENCES class_types(id),
  trainer_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  max_capacity  INT NOT NULL CHECK (max_capacity > 0),
  enrolled_count INT NOT NULL DEFAULT 0 CHECK (enrolled_count >= 0),
  status        TEXT NOT NULL DEFAULT 'scheduled' 
                CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
  cancel_reason TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_session_time CHECK (ends_at > starts_at),
  CONSTRAINT capacity_not_exceeded CHECK (enrolled_count <= max_capacity)
);

-- Performance indexes
CREATE INDEX idx_sessions_starts ON class_sessions(starts_at) WHERE status = 'scheduled';
CREATE INDEX idx_sessions_type ON class_sessions(class_type_id, starts_at);
CREATE INDEX idx_sessions_trainer ON class_sessions(trainer_id, starts_at);

-- Prevent duplicate sessions (same type, same start time)
CREATE UNIQUE INDEX idx_no_duplicate_session 
  ON class_sessions(class_type_id, starts_at) 
  WHERE status != 'cancelled';

-- RLS
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_sessions" ON class_sessions FOR SELECT USING (true);
CREATE POLICY "admin_manage_sessions" ON class_sessions FOR ALL USING (public.is_admin_or_trainer());
```

---

#### `enrollments` — NEW (client books a session)
```sql
CREATE TABLE enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id        UUID REFERENCES children(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed','cancelled','no_show','attended')),
  booked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at    TIMESTAMPTZ,
  cancel_reason   TEXT,
  attended_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- PARTIAL unique: only prevent double-booking of ACTIVE enrollments
-- Allows re-booking after cancellation
CREATE UNIQUE INDEX idx_unique_active_enrollment
  ON enrollments(session_id, user_id, COALESCE(child_id, '00000000-0000-0000-0000-000000000000'))
  WHERE status IN ('confirmed');

CREATE INDEX idx_enrollments_user ON enrollments(user_id, status);
CREATE INDEX idx_enrollments_session ON enrollments(session_id, status);
CREATE INDEX idx_enrollments_sub ON enrollments(subscription_id);

-- RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_enrollments" ON enrollments
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "admin_all_enrollments" ON enrollments
  FOR ALL USING (public.is_admin_or_trainer());
```

---

#### `subscriptions` — EXISTS, enhance with ALTER
```sql
-- New columns on existing table
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES children(id),
  ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'regular' 
    CHECK (subscription_type IN ('regular','individual','trial','group')),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
    CHECK (status IN ('active','frozen','expired','exhausted')),
  ADD COLUMN IF NOT EXISTS max_freezes INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS freezes_used INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update expires_at to be NOT NULL with explicit value (admin must set)
-- Don't use DEFAULT — admin explicitly picks expiry based on package

-- Constraint: can't use more than you have
ALTER TABLE subscriptions ADD CONSTRAINT check_lessons_balance
  CHECK (lessons_used <= lessons_total);

-- Auto-update status trigger
CREATE OR REPLACE FUNCTION fn_update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't override if frozen
  IF NEW.status = 'frozen' THEN
    RETURN NEW;
  END IF;
  
  IF NEW.lessons_used >= NEW.lessons_total THEN
    NEW.status := 'exhausted';
  ELSIF NEW.expires_at IS NOT NULL AND NEW.expires_at < NOW() THEN
    NEW.status := 'expired';
  ELSE
    NEW.status := 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_subscription_status
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION fn_update_subscription_status();
```

---

#### `subscription_freezes` — NEW (QA FIX: removed invalid GENERATED column)
```sql
CREATE TABLE subscription_freezes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  frozen_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  planned_resume  TIMESTAMPTZ NOT NULL,             -- when admin plans to unfreeze
  actual_resume   TIMESTAMPTZ,                       -- when actually resumed (NULL = still frozen)
  reason          TEXT,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- QA NOTE: days_frozen is computed at QUERY TIME, not as GENERATED column.
-- PostgreSQL rejects NOW() in generated columns (volatile function).
-- Use: EXTRACT(DAY FROM COALESCE(actual_resume, NOW()) - frozen_at)::INT in queries/views

CREATE INDEX idx_freezes_sub ON subscription_freezes(subscription_id);

-- RLS
ALTER TABLE subscription_freezes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_freezes" ON subscription_freezes
  FOR SELECT USING (subscription_id IN (
    SELECT id FROM subscriptions WHERE user_id = auth.uid()
  ));
CREATE POLICY "admin_manage_freezes" ON subscription_freezes
  FOR ALL USING (public.is_admin());
```

---

#### `payments` — NEW (track cash/card payments)
```sql
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  amount          NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency        TEXT NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR','TRY','USD')),
  method          TEXT NOT NULL DEFAULT 'cash' CHECK (method IN ('cash','card','transfer')),
  received_by     UUID REFERENCES profiles(id),  -- admin who recorded it
  notes           TEXT,
  paid_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_sub ON payments(subscription_id);
CREATE INDEX idx_payments_user ON payments(user_id);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_payments" ON payments
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "admin_manage_payments" ON payments
  FOR ALL USING (public.is_admin());
```

---

#### `waitlist` — NEW
```sql
CREATE TABLE waitlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id    UUID REFERENCES children(id),
  position    INT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'waiting'
              CHECK (status IN ('waiting','offered','confirmed','expired','cancelled')),
  offered_at  TIMESTAMPTZ,          -- when spot was offered
  expires_at  TIMESTAMPTZ,          -- deadline to confirm (offered_at + 2hr)
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_active_waitlist 
    UNIQUE(session_id, user_id, COALESCE(child_id, '00000000-0000-0000-0000-000000000000'))
);

CREATE INDEX idx_waitlist_session ON waitlist(session_id, position) WHERE status = 'waiting';

-- Auto-assign position
CREATE OR REPLACE FUNCTION fn_waitlist_auto_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.position IS NULL OR NEW.position = 0 THEN
    SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
    FROM waitlist
    WHERE session_id = NEW.session_id AND status IN ('waiting','offered');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_waitlist_position
  BEFORE INSERT ON waitlist
  FOR EACH ROW EXECUTE FUNCTION fn_waitlist_auto_position();

-- RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_waitlist" ON waitlist
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "admin_manage_waitlist" ON waitlist
  FOR ALL USING (public.is_admin());
```

---

#### `notifications` — NEW
```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN (
    'sub_expiring','sub_expired','sub_low','class_reminder',
    'class_cancelled','waitlist_available','booking_confirmed',
    'payment_recorded','general'
  )),
  title       TEXT NOT NULL,
  body        TEXT,
  metadata    JSONB DEFAULT '{}',
  channel     TEXT NOT NULL DEFAULT 'in_app'
              CHECK (channel IN ('in_app','telegram','email')),
  sent_at     TIMESTAMPTZ,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread 
  ON notifications(user_id, created_at DESC) 
  WHERE read_at IS NULL;

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_mark_read" ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin_manage_notifications" ON notifications
  FOR ALL USING (public.is_admin());
```

---

#### `studio_settings` — NEW (configurable business rules)
```sql
CREATE TABLE studio_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_by  UUID REFERENCES profiles(id)
);

-- Seed defaults
INSERT INTO studio_settings (key, value) VALUES
  ('cancellation_policy_hours', '24'),
  ('no_show_deducts_lesson', 'true'),
  ('max_freeze_days', '30'),
  ('waitlist_offer_hours', '2'),
  ('session_generation_weeks_ahead', '2'),
  ('default_subscription_days', '30'),
  ('booking_opens_days_ahead', '14'),
  ('class_reminder_hours_before', '24'),
  ('sub_expiry_warning_days', '3'),
  ('sub_low_lessons_threshold', '2'),
  ('studio_timezone', '"Europe/Istanbul"'),
  ('supported_languages', '["tr","en","ru"]');

-- RLS
ALTER TABLE studio_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_settings" ON studio_settings FOR SELECT USING (true);
CREATE POLICY "admin_manage_settings" ON studio_settings FOR ALL USING (public.is_admin());
```

---

#### `audit_log` — NEW (all admin actions)
```sql
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID NOT NULL REFERENCES profiles(id),
  action      TEXT NOT NULL,       -- 'subscription.create', 'session.cancel', etc.
  entity_type TEXT NOT NULL,       -- 'subscription', 'enrollment', 'session'
  entity_id   TEXT NOT NULL,       -- UUID or ID of affected entity
  changes     JSONB,               -- {before: {...}, after: {...}}
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON audit_log(actor_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- RLS: only admins can view
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_read_audit" ON audit_log FOR SELECT USING (public.is_admin());
-- Insert via service role only (server actions)
```

---

### Critical Triggers

#### Enrolled Count Maintenance
```sql
CREATE OR REPLACE FUNCTION fn_update_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE class_sessions SET enrolled_count = enrolled_count + 1 WHERE id = NEW.session_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Becoming confirmed
    IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
      UPDATE class_sessions SET enrolled_count = enrolled_count + 1 WHERE id = NEW.session_id;
    -- Leaving confirmed
    ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
      UPDATE class_sessions SET enrolled_count = enrolled_count - 1 WHERE id = NEW.session_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE class_sessions SET enrolled_count = enrolled_count - 1 WHERE id = OLD.session_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enrolled_count
  AFTER INSERT OR UPDATE OR DELETE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION fn_update_enrolled_count();
```

#### Waitlist Promotion (when spot opens)
```sql
CREATE OR REPLACE FUNCTION fn_promote_waitlist()
RETURNS TRIGGER AS $$
DECLARE
  next_in_queue RECORD;
BEGIN
  -- Only fire when an enrollment is cancelled
  IF OLD.status = 'confirmed' AND NEW.status IN ('cancelled', 'no_show') THEN
    -- Find next waiting person
    SELECT * INTO next_in_queue FROM waitlist
    WHERE session_id = NEW.session_id AND status = 'waiting'
    ORDER BY position ASC LIMIT 1;
    
    IF next_in_queue IS NOT NULL THEN
      UPDATE waitlist SET 
        status = 'offered',
        offered_at = NOW(),
        expires_at = NOW() + INTERVAL '2 hours'
      WHERE id = next_in_queue.id;
      
      -- Insert notification
      INSERT INTO notifications (user_id, type, title, body, channel, metadata)
      VALUES (
        next_in_queue.user_id,
        'waitlist_available',
        'Spot available!',
        'A spot opened up in your waitlisted class. Confirm within 2 hours.',
        'telegram',
        jsonb_build_object('session_id', NEW.session_id, 'waitlist_id', next_in_queue.id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_promote_waitlist
  AFTER UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION fn_promote_waitlist();
```

---

## 4. SUBSCRIPTION STATE MACHINE

```
                    ┌─────────────┐
          create    │             │  lessons_used = lessons_total
      ────────────► │   ACTIVE    ├────────────────────────────────┐
                    │             │                                 │
                    └──────┬──────┘                                 ▼
                           │                              ┌────────────────┐
                    freeze │                              │   EXHAUSTED    │
                           │                              └────────────────┘
                           ▼
                    ┌─────────────┐
                    │   FROZEN    │
                    └──────┬──────┘
                           │
                  unfreeze │  (extend expiry by frozen_days)
                           │
                           ▼
                    ┌─────────────┐
                    │   ACTIVE    │  expires_at < NOW()
                    │  (extended) ├────────────────────────────────┐
                    └─────────────┘                                ▼
                                                          ┌────────────────┐
                                                          │    EXPIRED     │
                                                          └────────────────┘
```

### Subscription Selection (FIFO Logic)
```typescript
// src/domain/subscription.ts
export function selectSubscription(
  subscriptions: Subscription[],
  childId: string | null
): Subscription | null {
  return subscriptions
    .filter(s => s.status === 'active')
    .filter(s => !childId || s.child_id === childId || s.child_id === null)
    .sort((a, b) => {
      // Prefer child-specific subscription
      if (a.child_id === childId && b.child_id !== childId) return -1;
      if (b.child_id === childId && a.child_id !== childId) return 1;
      // Then FIFO: earliest expiry first
      return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
    })[0] ?? null;
}
```

---

## 5. USER FLOWS & SCREENS

### 5.1 Client Portal Routes (Mobile-First)

| Route | Purpose | Auth | Data Strategy |
|-------|---------|------|---------------|
| `/` | Landing page | Public | SSG (existing) |
| `/schedule` | Weekly calendar | Public | ISR 60s + Realtime counter |
| `/schedule/[id]` | Session detail | Public | Dynamic RSC |
| `/auth/login` | Phone/Email OTP | Public | Client component |
| `/auth/register` | Name + phone + child | Public | Server Action |
| `/auth/callback` | Magic link exchange | Public | Route Handler |
| `/my` | Dashboard overview | User | RSC + Suspense |
| `/my/subscriptions` | Balance cards | User | RSC |
| `/my/classes` | Upcoming + history | User | RSC + pagination |
| `/my/children` | CRUD child profiles | User | Server Actions |
| `/my/notifications` | Notification center | User | RSC + Realtime |
| `/my/settings` | Preferences, language | User | Server Actions |

### 5.2 Admin Portal Routes

| Route | Purpose | Auth | Data Strategy |
|-------|---------|------|---------------|
| `/admin` | KPI dashboard | Admin | RSC + revalidate 300s |
| `/admin/today` | Today's classes | Admin/Trainer | RSC + Realtime |
| `/admin/schedule` | Template CRUD | Admin | Server Actions |
| `/admin/sessions` | Session list/cancel | Admin | RSC + filters |
| `/admin/attendance/[id]` | Check-in UI | Admin/Trainer | Optimistic + SA |
| `/admin/subscriptions` | All subs + create | Admin | RSC + search |
| `/admin/clients` | Client directory | Admin | RSC + search |
| `/admin/clients/[id]` | Client detail | Admin | RSC |
| `/admin/payments` | Payment log | Admin | RSC + filters |
| `/admin/notifications` | Send/view log | Admin | Server Actions |
| `/admin/settings` | Studio config | Admin | Server Actions |
| `/admin/content` | CMS (existing) | Admin | Existing |
| `/admin/media` | Media upload (existing) | Admin | Existing |

### 5.3 Key User Journeys (Validated)

#### Journey A: New Client → First Booking
```
1. Discovers studio on Instagram → taps link → Landing page (/)
2. Scrolls to schedule section → taps "View Full Schedule"
3. /schedule → sees week view, color-coded classes
4. Taps "Drawing, Tue 16:00" → /schedule/[id]
5. Sees: 5/8 spots, age 4+, 60 min, instructor name
6. Taps "Book" → redirect to /auth/login
7. Enters phone → receives OTP → enters code
8. First login → /auth/register (add name + child)
9. Back to /schedule/[id] → "Book" → shows "Need subscription"
10. → Contacts admin (WhatsApp/in-person) → admin creates subscription
11. → Refresh → "Book" → ✅ Confirmed (optimistic, balance: 8→7)
12. → Telegram: "✅ Booked: Drawing, Tue 16:00, Alanya Studio"
```

#### Journey B: Admin Morning Routine
```
1. Opens /admin/today → sees today's 4 classes with enrollment status
2. First class starts → taps → /admin/attendance/[sessionId]
3. Sees checklist of 6 enrolled children
4. Checks 5 present, marks 1 no-show
5. System: deducts lessons from 5 subscriptions, applies no-show policy
6. Sees alert: "Ayşe has 1 lesson remaining" → taps → send renewal reminder
7. Parent comes, pays cash → /admin/subscriptions → creates new sub (8 lessons)
8. Records payment → /admin/payments → ₺800 cash
```

---

## 6. EDGE CASES & NEGATIVE SCENARIOS (Expanded)

### Booking Logic Matrix
| Condition | Allow Booking? | User Feedback |
|-----------|---------------|---------------|
| Active sub + lessons remaining | ✅ Yes | "Booked! Balance: N-1 remaining" |
| Active sub + 0 lessons | ❌ No | "All lessons used. Renew subscription to book." |
| Expired sub | ❌ No | "Subscription expired [date]. Contact admin to renew." |
| No subscription at all | ❌ No | "No active subscription. Visit studio to purchase." |
| Frozen sub | ❌ No | "Subscription frozen until [date]." |
| Session is full | ❌ No (offer waitlist) | "Class full. Join waitlist? (Position: #3)" |
| Already enrolled in this session | ❌ No | "You're already booked for this class." |
| Child too young/old for class | ⚠️ Warning | "Recommended age: 5-14. Book anyway?" |
| Time conflict with another booking | ⚠️ Warning | "You have Chess at 16:00 same day. Continue?" |
| Sub valid when booked, expired at class time | ✅ Honor | (admin note: "Booked before expiry") |

### Cancellation Logic
| Timing | Lesson Refunded? | Configurable? |
|--------|-----------------|---------------|
| > `cancellation_policy_hours` before | ✅ Yes | `studio_settings` |
| < `cancellation_policy_hours` before | ❌ No (deducted) | `studio_settings` |
| Admin cancels class | ✅ Always refund | Automatic |
| Admin cancels enrollment | ✅ Admin choice | Manual |

### Concurrency Safety
| Race Condition | Protection Mechanism |
|---------------|---------------------|
| Two clients book last spot | `CHECK(enrolled_count <= max_capacity)` + transaction |
| Double lesson deduction | `CHECK(lessons_used <= lessons_total)` aborts second |
| Concurrent freeze + booking | `status = 'active'` checked in booking server action |
| Waitlist double-offer | `status = 'waiting'` checked with `FOR UPDATE` lock |

---

## 7. UI/UX DESIGN SYSTEM

### Brand Tokens (Tailwind v4 `@theme inline`)
```css
/* src/app/globals.css */
@import "tailwindcss";

@theme inline {
  /* Primary */
  --color-pink: #DCA8B2;
  --color-pink-light: #F5E6EA;
  --color-pink-dark: #B87A88;
  --color-blue: #A9C7E5;
  --color-blue-light: #E3F0FA;
  --color-blue-dark: #6B9DC7;

  /* Neutrals */
  --color-bg: #FEFCFD;
  --color-surface: #FFFFFF;
  --color-border: #F0E8EB;
  --color-muted: #9B8A8F;
  --color-foreground: #2D2327;

  /* Class types */
  --color-class-drawing: #DCA8B2;
  --color-class-chess: #A9C7E5;
  --color-class-workshop: #B8D4A8;
  --color-class-miniclub: #F2D479;

  /* Semantic */
  --color-success: #6BBF7A;
  --color-warning: #F2B63D;
  --color-error: #E5686B;
  --color-info: #A9C7E5;

  /* Radius */
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1.25rem;
  --radius-full: 9999px;

  /* Fonts — loaded via next/font, referenced here */
  --font-display: var(--font-playfair);
  --font-body: var(--font-inter);
}
```

### Font Loading (Fixed — no render-blocking `<link>`)
```typescript
// src/app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap'
})

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap'
})

// <body className={`${inter.variable} ${playfair.variable}`}>
```

### Component Architecture
```
src/components/
├── ui/                     # Atoms (Button, Input, Badge, Card, Avatar)
├── forms/                  # Form components (LoginForm, BookingForm, ChildForm)
├── schedule/               # ScheduleCalendar, ClassCard, TimeSlot, DayColumn
├── subscription/           # SubscriptionCard, BalanceBar, ExpiryBadge
├── attendance/             # AttendanceList, CheckItem, QRScanner
├── notifications/          # NotificationBell, NotificationItem, NotificationList
├── admin/                  # AdminSidebar, StatsCard, DataTable
├── layout/                 # ClientNav, AdminNav, PageHeader
└── sections/               # Landing page sections (existing)
```

### Mobile-First Breakpoints (Tailwind v4)
```
default:    mobile (< 640px)    — Client primary target
sm:         ≥ 640px             — Large phones
md:         ≥ 768px             — Tablets (admin on iPad)
lg:         ≥ 1024px            — Desktop (admin laptop)
xl:         ≥ 1280px            — Large desktop
```

---

## 8. INTERNATIONALIZATION (i18n)

### Strategy: Database + Static Hybrid
```
- Database content: name_tr, name_en, name_ru columns (class types, exceptions)
- UI strings: src/i18n/translations.ts (existing, extend for new pages)
- Notifications: template-based, rendered in user's preferred_language
- URL: No locale prefix (single market). Language from user preference cookie.
```

### Translation Key Structure (extend existing)
```typescript
// src/i18n/translations.ts — add keys:
schedule: {
  title: { tr: 'Haftalık Program', en: 'Weekly Schedule', ru: 'Расписание' },
  spots_available: { tr: '{n} yer mevcut', en: '{n} spots available', ru: '{n} мест свободно' },
  full: { tr: 'Dolu', en: 'Full', ru: 'Мест нет' },
  book: { tr: 'Rezervasyon', en: 'Book', ru: 'Записаться' },
  waitlist: { tr: 'Bekleme listesi', en: 'Join Waitlist', ru: 'В лист ожидания' },
},
subscription: {
  lessons_remaining: { tr: '{n} ders kaldı', en: '{n} lessons left', ru: 'Осталось {n} занятий' },
  expires: { tr: '{date} tarihinde bitiyor', en: 'Expires {date}', ru: 'Истекает {date}' },
  // ...
}
```

---

## 9. SERVER ACTIONS — Result Pattern (QA Fix)

### Type-Safe Result Type
```typescript
// src/lib/result.ts
export type Result<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

// Usage in server actions:
export async function bookClass(
  sessionId: string, 
  childId?: string
): Promise<Result<{ enrollmentId: string; remainingLessons: number }>> {
  // Validation
  const parsed = bookClassSchema.safeParse({ sessionId, childId })
  if (!parsed.success) {
    return { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' }
  }
  
  // Auth check
  const supabase = await createClient()
  const { data: { claims } } = await supabase.auth.getClaims()
  if (!claims) {
    return { success: false, error: 'Not authenticated', code: 'AUTH_ERROR' }
  }
  
  // Business logic...
  // ...
  
  return { success: true, data: { enrollmentId: '...', remainingLessons: 7 } }
}
```

### All Server Actions (Corrected Signatures)
```typescript
// ─── Booking ────────────────────────────────────────────
'use server'
bookClass(sessionId, childId?) → Result<{enrollmentId, remainingLessons}>
cancelBooking(enrollmentId) → Result<{refunded: boolean}>
joinWaitlist(sessionId, childId?) → Result<{position: number}>
confirmWaitlistOffer(waitlistId) → Result<{enrollmentId}>

// ─── Subscriptions (Admin) ──────────────────────────────
createSubscription(data) → Result<{id, expiresAt}>
freezeSubscription(subId, until, reason) → Result
unfreezeSubscription(subId) → Result<{newExpiresAt}>
renewSubscription(oldSubId, packageId) → Result<{newSubId}>

// ─── Attendance (Admin/Trainer) ─────────────────────────
markAttendance(sessionId, presentIds[]) → Result<{deducted: number}>
markNoShow(sessionId, noShowIds[]) → Result
completeSession(sessionId) → Result

// ─── Schedule (Admin) ───────────────────────────────────
createClassType(data) → Result<{id}>
updateClassType(id, data) → Result
createTemplate(data) → Result<{id}>
updateTemplate(id, data) → Result
cancelSession(sessionId, reason) → Result<{refundedCount: number}>
generateSessions(weeksAhead) → Result<{generated: number}>

// ─── Children (User) ────────────────────────────────────
addChild(data) → Result<{id}>
updateChild(id, data) → Result
removeChild(id) → Result

// ─── Payments (Admin) ───────────────────────────────────
recordPayment(data) → Result<{id}>

// ─── Settings (Admin) ───────────────────────────────────
updateSetting(key, value) → Result
```

---

## 10. API ROUTES (Webhooks & Cron)

```typescript
// External integrations — NOT server actions (need external access)

POST /api/auth/callback          → Exchange magic link code for session
POST /api/telegram/webhook       → Incoming Telegram bot commands
POST /api/cron/generate-sessions → Generate sessions 2 weeks ahead (Vercel Cron)
POST /api/cron/send-reminders    → 24hr-before class reminders (Vercel Cron)
POST /api/cron/check-expirations → Expire subscriptions, notify (Vercel Cron)
POST /api/cron/expire-waitlist   → Expire unconfirmed waitlist offers (Vercel Cron)
GET  /api/schedule/public        → Public schedule JSON (for external embeds)
```

### Vercel Cron Configuration
```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/generate-sessions", "schedule": "0 2 * * 0" },
    { "path": "/api/cron/send-reminders",    "schedule": "0 9 * * *" },
    { "path": "/api/cron/check-expirations", "schedule": "0 0 * * *" },
    { "path": "/api/cron/expire-waitlist",   "schedule": "*/15 * * * *" }
  ]
}
```

---

## 11. CACHING & REVALIDATION STRATEGY

| Route | Strategy | TTL | Revalidation Trigger |
|-------|----------|-----|---------------------|
| `/schedule` | ISR | 60s | `revalidatePath('/schedule')` on enrollment/cancellation |
| `/schedule/[id]` | Dynamic RSC | 0 | Always fresh (shows live count) |
| `/my/*` | Dynamic RSC | 0 | User-specific, no caching |
| `/admin/*` | Dynamic RSC | 0 | Real-time data needed |
| `/` (landing) | SSG | Build time | Revalidate on CMS update |
| `/api/schedule/public` | ISR | 300s | On template change |
| Class types data | React `cache()` | Per-request | Rarely changes |
| Studio settings | React `cache()` | Per-request | On settings update |

### Realtime Subscriptions (Client Components)
```typescript
// Only Client Components can maintain WebSocket connections
// Pattern: RSC renders initial data, Client Component subscribes to changes

'use client'
function LiveEnrolledCount({ sessionId, initial }: Props) {
  const [count, setCount] = useState(initial)
  
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'class_sessions',
        filter: `id=eq.${sessionId}`
      }, (payload) => {
        setCount(payload.new.enrolled_count)
      })
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [sessionId])
  
  return <span>{count}</span>
}
```

---

## 12. IMPLEMENTATION PHASES (Revised)

### Phase 1: Foundation — Auth + DB + Navigation (Week 1)
**Acceptance: User can register, login, see protected pages, admin sees admin panel**

- [ ] Migration 0005: All new tables (children, class_types, schedule_templates, class_sessions, enrollments, waitlist, notifications, subscription_freezes, payments, studio_settings, schedule_exceptions, audit_log)
- [ ] Replace `proxy.ts` with official Supabase auth pattern (`updateSession` + `getClaims`)
- [ ] Replace `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] Update `src/lib/supabase/client.ts` and `server.ts`
- [ ] Migrate font loading to `next/font/google` (remove `<link>` tags)
- [ ] `/auth/login` page (phone OTP + email tabs)
- [ ] `/auth/register` page (name, phone, add first child)
- [ ] `/auth/callback` route handler (magic link exchange)
- [ ] Client layout: `/my` with bottom tab navigation (Home, Schedule, My Classes, Profile)
- [ ] Admin layout: `/admin` with sidebar (existing, enhance)
- [ ] Role check in proxy: admin → admin panel, user → client portal
- [ ] `supabase gen types` → `src/lib/database.types.ts`
- [ ] Zod schemas: `src/lib/schemas/` (auth, child, subscription, enrollment)
- [ ] Result type: `src/lib/result.ts`
- [ ] Vitest setup + first domain unit tests

### Phase 2: Schedule System (Week 2)
**Acceptance: Admin creates templates → sessions auto-generate → clients see calendar**

- [ ] Admin: Class types CRUD (`/admin/settings/class-types`)
- [ ] Admin: Schedule template builder (weekly grid view)
- [ ] Admin: Schedule exceptions (mark holidays)
- [ ] Session generation logic (`src/domain/schedule.ts`)
- [ ] Cron: `/api/cron/generate-sessions` (Sundays 2am)
- [ ] Public: `/schedule` — Week view calendar (ISR 60s)
- [ ] Public: `/schedule/[id]` — Session detail page
- [ ] Realtime: Live `enrolled_count` updates on schedule page
- [ ] Age-based filtering (calculate from child birth_date)
- [ ] Mobile: Swipeable week navigation

### Phase 3: Booking & Subscriptions (Week 3)
**Acceptance: Client books class (lesson deducted), admin manages subscriptions**

- [ ] Admin: Create subscription form (user, package, child, expiry date)
- [ ] Admin: Subscription list with filters (active/expired/exhausted/frozen)
- [ ] Admin: Record payment form
- [ ] Client: Book class session (Server Action with full validation)
- [ ] Client: Cancel booking (24hr policy from settings)
- [ ] Client: `/my/classes` (upcoming sorted by date, past with status badges)
- [ ] Client: `/my/subscriptions` (balance bar, expiry countdown)
- [ ] Subscription FIFO selection logic
- [ ] Waitlist: Auto-enqueue when full, position display
- [ ] Optimistic UI: Instant booking feedback
- [ ] E2E tests: Happy path + edge cases (full class, no balance, expired)

### Phase 4: Attendance & Notifications (Week 4)
**Acceptance: Admin marks attendance → lessons deducted → notifications sent**

- [ ] Admin: `/admin/attendance/[id]` — Checklist per session
- [ ] Attendance marking (Server Action, updates enrollment status)
- [ ] Trigger: `fn_update_enrolled_count` fires correctly
- [ ] No-show handling (configurable via studio_settings)
- [ ] Complete session action (marks session as completed)
- [ ] Notification engine: `src/domain/notification.ts`
- [ ] Telegram Bot: `/api/telegram/webhook` (basic commands)
- [ ] Telegram: Send booking confirmations, reminders, waitlist offers
- [ ] Email via Resend: Fallback for users without Telegram
- [ ] Client: `/my/notifications` (in-app notification center)
- [ ] Cron: `/api/cron/send-reminders` (24hr before class)
- [ ] Cron: `/api/cron/check-expirations` (daily subscription check)

### Phase 5: Advanced Features (Week 5-6)
**Acceptance: Freeze works, waitlist promotes, analytics visible, PWA installable**

- [ ] Subscription freeze/unfreeze (auto-extend expiry)
- [ ] Waitlist: Auto-promote trigger + notification + 2hr confirm window
- [ ] Cron: `/api/cron/expire-waitlist` (every 15 min)
- [ ] Admin: `/admin/clients/[id]` (full history, children, subscriptions, payments)
- [ ] Admin: Analytics dashboard (attendance rate, popular classes, revenue)
- [ ] Admin: Session cancellation (bulk refund + notify)
- [ ] Client: Children management (`/my/children`)
- [ ] Client: Language/notification preferences
- [ ] PWA: Service worker (Serwist), offline schedule cache
- [ ] Audit log: All admin actions automatically recorded
- [ ] E2E tests: Freeze, waitlist, cancellation flows

### Phase 6: Hardening & Launch (Week 7)
**Acceptance: Production-ready, all security checks pass, monitoring live**

- [ ] Error boundaries on all routes
- [ ] Rate limiting: Auth (5/hr), Booking (20/hr), API (100/min)
- [ ] CSRF protection (Next.js built-in for Server Actions)
- [ ] Input sanitization (Zod strips unknown fields)
- [ ] Content Security Policy headers
- [ ] KVKK compliance: Data export, deletion, consent forms
- [ ] Accessibility audit (axe-core, keyboard nav, screen reader)
- [ ] Performance audit (Lighthouse > 90 all categories)
- [ ] Load test: 100 concurrent users via k6 or Artillery
- [ ] Sentry setup: Error tracking + performance monitoring
- [ ] Vercel Analytics: Core Web Vitals tracking
- [ ] Final E2E suite: 200+ tests (all flows)
- [ ] Deployment: Production Vercel + Supabase Pro if needed
- [ ] Documentation: Admin user guide (how to manage schedule)
- [ ] Client onboarding: In-app tutorial on first login

---

## 13. CI/CD PIPELINE

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci
      - run: npx vitest run

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npx playwright test --project=chromium
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.SUPABASE_KEY }}

  deploy-preview:
    needs: [lint-and-type-check, unit-tests]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT }}
```

### Supabase Migration Workflow
```
Development:  supabase db push (local → remote)
Staging:      PR creates Supabase branch (supabase db branch)
Production:   Merge triggers supabase db push to production
```

---

## 14. SECURITY CHECKLIST (Enhanced)

### Authentication & Authorization
- [ ] Supabase Auth with `getClaims()` (JWT signature validated)
- [ ] Never trust `getSession()` on the server
- [ ] Publishable key (not anon key) — no elevated privileges
- [ ] Service role used ONLY in server-side code behind auth check
- [ ] Role stored in `profiles.role`, checked in proxy + RLS
- [ ] Session auto-refresh via proxy.ts on every request
- [ ] OTP rate limit: 5 attempts/hour (Supabase built-in)

### Data Protection
- [ ] All tables have RLS enabled
- [ ] RLS policies use `is_admin()` SECURITY DEFINER function (no recursion)
- [ ] Children data: accessible only to parent + admin
- [ ] Medical notes: encrypted at rest (Supabase default)
- [ ] Audit log: immutable (INSERT only via service role)

### Input & Output
- [ ] Zod validation on ALL Server Action inputs
- [ ] Zod `.strip()` to remove unknown fields
- [ ] No raw SQL — all queries via Supabase SDK (parameterized)
- [ ] HTML escaping by default (React does this)
- [ ] CSP headers: `script-src 'self'`
- [ ] File uploads: MIME check + 5MB limit + Supabase policies

### Infrastructure
- [ ] HTTPS everywhere (Vercel default)
- [ ] Environment variables in Vercel (never committed)
- [ ] `CRON_SECRET` env var to protect cron endpoints
- [ ] Supabase project: password auth disabled (OTP only)
- [ ] Database: SSL mode required

---

## 15. LEGAL COMPLIANCE (KVKK + GDPR)

Turkey's KVKK (Personal Data Protection Law) applies:

- [ ] **Consent**: Explicit consent on registration (checkbox, stored in profiles)
- [ ] **Data minimization**: Only collect what's needed
- [ ] **Right to access**: `/my/settings` → "Download my data" (JSON export)
- [ ] **Right to erasure**: `/my/settings` → "Delete my account" (anonymize, don't hard-delete for audit)
- [ ] **Data location**: EU-West-1 (Supabase), compliant with Turkey's cross-border rules
- [ ] **Retention**: Attendance data kept 2 years, then archived
- [ ] **Children's data**: Parent consent required (parent creates child profile = consent)
- [ ] **Privacy policy**: `/privacy` page (existing, update for new data collection)

---

## 16. PERFORMANCE TARGETS (Measurable)

| Metric | Target | Measurement | Strategy |
|--------|--------|-------------|----------|
| FCP | < 1.0s | Vercel Analytics | `next/font`, RSC streaming |
| LCP | < 2.0s | Lighthouse | Image optimization, ISR |
| CLS | < 0.05 | Lighthouse | `next/font` (eliminates FOUT) |
| INP | < 100ms | Vercel Analytics | Server Actions, minimal hydration |
| TTI | < 3.0s | Lighthouse | Code splitting, RSC |
| Schedule page load | < 800ms | Custom metric | ISR 60s + edge cache |
| Booking action | < 400ms | Custom metric | Optimistic UI + SA |
| API p95 latency | < 150ms | Vercel Functions tab | Supavisor, indexes |
| Bundle (client JS) | < 100KB | `next build` output | RSC, tree-shaking |
| Image load | < 1s | Custom metric | `next/image`, WebP, CDN |

---

## 17. MONITORING & ALERTING

| Tool | What It Monitors | Alert Threshold |
|------|-----------------|-----------------|
| Sentry | JS errors, unhandled rejections | > 5 errors/min |
| Vercel Analytics | Core Web Vitals, traffic | LCP > 4s p75 |
| Supabase Dashboard | DB connections, RLS denials | Connections > 80% |
| Custom (audit_log) | Admin actions, security events | Unusual patterns |
| Uptime (Vercel) | Site availability | Down > 1 min |
| Cron monitoring | Cron execution status | Failure |

---

## 18. MIGRATION STRATEGY (Existing Data)

### Current Data to Preserve
| Table | Records | Action |
|-------|---------|--------|
| `profiles` | ~5-10 | Keep, add new columns |
| `packages` | 6 | Keep (still used for pricing) |
| `subscriptions` | ~10 | Keep, add new columns |
| `bookings` (guest) | ~50 | Archive to `legacy_bookings`, not active |
| `attendance` | ~20 | Keep linked to old bookings |
| `site_content` | ~30 | Keep (CMS data) |

### Migration Plan
```sql
-- Migration 0005: Step 1 — Preserve existing data
ALTER TABLE bookings RENAME TO legacy_bookings;
-- New enrollments table takes over for authenticated bookings
-- Guest inquiries still come through existing booking form → stored in legacy_bookings
```

---

## 19. FOLDER STRUCTURE (Target)

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx                    # Root layout (fonts, providers)
│   ├── page.tsx                      # Landing page (existing)
│   ├── (public)/                     # Public routes group
│   │   ├── schedule/
│   │   │   ├── page.tsx              # Weekly calendar
│   │   │   └── [id]/page.tsx         # Session detail
│   │   ├── privacy/page.tsx          # Existing
│   │   └── imprint/page.tsx          # Existing
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── callback/route.ts
│   ├── my/                           # Client portal (protected)
│   │   ├── layout.tsx                # Bottom nav
│   │   ├── page.tsx                  # Dashboard
│   │   ├── subscriptions/page.tsx
│   │   ├── classes/page.tsx
│   │   ├── children/page.tsx
│   │   ├── notifications/page.tsx
│   │   └── settings/page.tsx
│   ├── admin/                        # Admin portal (protected)
│   │   ├── layout.tsx                # Sidebar nav
│   │   ├── page.tsx                  # Analytics (existing, enhanced)
│   │   ├── today/page.tsx
│   │   ├── schedule/page.tsx
│   │   ├── sessions/page.tsx
│   │   ├── attendance/[id]/page.tsx
│   │   ├── subscriptions/page.tsx
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── content/page.tsx          # Existing CMS
│   │   └── media/page.tsx            # Existing uploads
│   └── api/
│       ├── auth/callback/route.ts
│       ├── telegram/webhook/route.ts
│       ├── schedule/public/route.ts
│       └── cron/
│           ├── generate-sessions/route.ts
│           ├── send-reminders/route.ts
│           ├── check-expirations/route.ts
│           └── expire-waitlist/route.ts
├── components/
│   ├── ui/                           # Shared primitives
│   ├── forms/
│   ├── schedule/
│   ├── subscription/
│   ├── attendance/
│   ├── notifications/
│   ├── admin/
│   ├── layout/
│   └── sections/                     # Landing page (existing)
├── domain/                           # Pure business logic (no framework deps)
│   ├── subscription.ts
│   ├── booking.ts
│   ├── attendance.ts
│   ├── schedule.ts
│   ├── notification.ts
│   └── waitlist.ts
├── actions/                          # Server Actions
│   ├── booking.ts
│   ├── subscription.ts
│   ├── attendance.ts
│   ├── schedule.ts
│   ├── children.ts
│   ├── payments.ts
│   └── settings.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── admin.ts                  # Service role (existing)
│   │   └── proxy.ts                  # Session refresh
│   ├── database.types.ts             # Auto-generated
│   ├── result.ts                     # Result<T> type
│   └── schemas/                      # Zod schemas
│       ├── auth.ts
│       ├── child.ts
│       ├── subscription.ts
│       ├── enrollment.ts
│       └── schedule.ts
├── i18n/
│   └── translations.ts              # Existing, extended
└── proxy.ts                          # Auth gate (Supabase pattern)
```

---

## 20. EXTERNAL DEPENDENCIES

| Service | Purpose | Cost (Monthly) | Tier |
|---------|---------|----------------|------|
| Supabase | Auth, DB, Realtime, Storage | $0 (Free) → $25 (Pro) | Free handles 100 users |
| Vercel | Hosting, Edge, Cron | $0 (Hobby) → $20 (Pro) | Hobby for now |
| Resend | Transactional email | $0 (100/day free) | Free tier |
| Telegram Bot API | Notifications | $0 (always free) | — |
| Sentry | Error monitoring | $0 (5K events/month) | Free tier |
| Domain (makeartalanya.com) | DNS | ~$12/year | Already owned |

**Total: $0-45/month** — scales when user count exceeds free tier limits

---

## 21. RISK REGISTER (Updated)

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|-----------|--------|------------|-------|
| Phone OTP delivery fails in Turkey | Medium | High | Email magic link fallback, Supabase uses Twilio/MessageBird | Dev |
| Supabase free tier limits hit | Low (< 100 users) | Medium | Monitor, upgrade to Pro at 500 MAU | Admin |
| Client adoption resistance | Medium | High | Simple UX, Telegram (familiar), 1:1 onboarding | Studio |
| Data loss | Very Low | Critical | Supabase daily backups, weekly export | Dev |
| Concurrent booking race condition | Low | Low | DB constraints + transaction + optimistic retry | Dev |
| Scope creep from client | High | Medium | Strict phase gates, "version 2" list | PM |
| Telegram bot blocked (Russia sanctions) | Low | Medium | Email + in-app notifications | Dev |
| KVKK audit | Low | High | Compliance built-in from Phase 1 | Dev |

---

## 22. WHAT'S INTENTIONALLY EXCLUDED (v2 Roadmap)

| Feature | Why Not Now | When |
|---------|-----------|------|
| Online payments (Stripe/Iyzico) | Clients pay in-person (Turkey norm) | v2 if requested |
| Multi-branch support | Single location studio | Never (unless they expand) |
| Native mobile app | PWA sufficient for 100-1000 users | v3 if scale demands |
| Video classes/streaming | In-person only | Never |
| Advanced CRM/email marketing | Instagram is their channel | v2 maybe |
| Payroll/HR for trainers | Out of scope | Never |
| Automated SMS (paid) | Telegram is free + preferred | v2 if needed |
| AI schedule optimization | Nice to have, not needed | v3 |

---

## 23. SUCCESS METRICS

| Metric | Before (Manual) | Target (With App) | How to Measure |
|--------|----------------|-------------------|----------------|
| Time to book a class | 5 min (WhatsApp back-and-forth) | 10 seconds | User testing |
| Admin scheduling time | 2 hr/week | 10 min/week (set once, auto-generate) | Admin feedback |
| Subscription counting errors | 2-3/month | 0 (automated) | Audit log |
| Client no-show rate | Unknown | Track → reduce 20% with reminders | attendance table |
| Subscription renewal rate | Unknown | Track → target 70% | subscriptions table |
| Schedule visibility | Only via WhatsApp/Instagram | 24/7 public web | Analytics |
| Payment tracking | Notebook | Digital, searchable, exportable | payments table |

---

## NEXT ACTION

Plan is QA-verified and ready for implementation.
**Start with Phase 1**: Migration + Auth + Navigation foundation.

All 20 issues from the audit have been resolved in this document.
