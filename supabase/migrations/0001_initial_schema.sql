-- Make Art Studio – Initial Schema
-- Supabase Project: makeartalanya (vnldsyjkhofofellwuiq)
-- Created: 2026-05-12

-- ── Enum Types ────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('admin', 'trainer', 'user');
CREATE TYPE lesson_language AS ENUM ('tr', 'en', 'ru');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- ── Profiles (extends auth.users) ─────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  phone       TEXT,
  role        user_role NOT NULL DEFAULT 'user',
  preferred_language lesson_language DEFAULT 'tr',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Subscription Packages ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS packages (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,          -- e.g. 'pack8'
  lessons_count   INT NOT NULL,           -- 1, 2, 4, 8, 12, 16
  price_eur       NUMERIC(8,2) NOT NULL,  -- total price in EUR
  price_per_lesson NUMERIC(8,2) NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed packages
INSERT INTO packages (name, lessons_count, price_eur, price_per_lesson) VALUES
  ('single',  1,  45.00, 45.00),
  ('pack2',   2,  84.00, 42.00),
  ('pack4',   4, 160.00, 40.00),
  ('pack8',   8, 296.00, 37.00),
  ('pack12', 12, 420.00, 35.00),
  ('pack16', 16, 512.00, 32.00);

-- ── Subscriptions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id      INT NOT NULL REFERENCES packages(id),
  lessons_total   INT NOT NULL,
  lessons_used    INT NOT NULL DEFAULT 0,
  lessons_remaining INT GENERATED ALWAYS AS (lessons_total - lessons_used) STORED,
  paid_at         TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,     -- NULL = no expiry
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Bookings ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Unauthenticated booking requests (landing page form)
  guest_name      TEXT,
  guest_email     TEXT,
  guest_phone     TEXT,
  preferred_language lesson_language DEFAULT 'tr',
  package_id      INT REFERENCES packages(id),
  message         TEXT,
  -- Authenticated bookings
  user_id         UUID REFERENCES profiles(id),
  subscription_id UUID REFERENCES subscriptions(id),
  scheduled_at    TIMESTAMPTZ,
  status          booking_status NOT NULL DEFAULT 'pending',
  notes           TEXT,   -- trainer notes
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Attendance ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  attended_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lesson_deducted BOOLEAN NOT NULL DEFAULT FALSE,
  deducted_at     TIMESTAMPTZ
);

-- Auto-deduct lesson on attendance insert
CREATE OR REPLACE FUNCTION deduct_lesson_on_attendance()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT NEW.lesson_deducted THEN
    UPDATE subscriptions
    SET lessons_used = lessons_used + 1
    WHERE id = NEW.subscription_id;

    NEW.lesson_deducted := TRUE;
    NEW.deducted_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_lesson
BEFORE INSERT ON attendance
FOR EACH ROW EXECUTE FUNCTION deduct_lesson_on_attendance();

-- ── RLS Policies ──────────────────────────────────────────────
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance    ENABLE ROW LEVEL SECURITY;

-- Profiles: users see own, admins see all
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "profiles_admin" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Bookings: guest insert (anon), user sees own
CREATE POLICY "bookings_insert_anon" ON bookings
  FOR INSERT WITH CHECK (user_id IS NULL);  -- guest bookings

CREATE POLICY "bookings_user_own" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bookings_admin" ON bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','trainer'))
  );

-- Subscriptions: own only, admin all
CREATE POLICY "subscriptions_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_admin" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
