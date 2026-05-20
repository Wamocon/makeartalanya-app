-- ======================================================================
-- SAMPLE DATA SEED - Make Art Alanya
-- Run AFTER 0005_full_studio_schema.sql
-- This inserts demo profiles, children, subscriptions, and sessions
-- ======================================================================

-- Sample profiles (these would normally be created via auth signup)
-- We use fixed UUIDs for referential integrity in seeds
INSERT INTO profiles (id, full_name, phone, role, preferred_language, telegram_chat_id)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Ayşe Yılmaz', '+905551234567', 'parent', 'tr', NULL),
  ('a0000000-0000-0000-0000-000000000002', 'Maria Ivanova', '+79161234567', 'parent', 'ru', NULL),
  ('a0000000-0000-0000-0000-000000000003', 'Sarah Johnson', '+447911123456', 'parent', 'en', NULL),
  ('a0000000-0000-0000-0000-000000000004', 'Zeynep Kaya', '+905559876543', 'parent', 'tr', NULL),
  ('a0000000-0000-0000-0000-000000000005', 'Olga Petrova', '+79031112233', 'parent', 'ru', NULL)
ON CONFLICT (id) DO NOTHING;

-- Children
INSERT INTO children (id, parent_id, full_name, birth_date, notes)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Elif Yılmaz', '2018-03-15', 'Alerji: Yok'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Can Yılmaz', '2020-07-22', NULL),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Misha Ivanov', '2017-11-03', 'Likes watercolors'),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'Emma Johnson', '2019-01-28', NULL),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'Defne Kaya', '2016-09-10', NULL),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', 'Nikita Petrov', '2018-05-20', 'Left-handed')
ON CONFLICT (id) DO NOTHING;

-- Packages (subscription offerings)
INSERT INTO packages (id, name, lessons_count, price, valid_days, is_active)
VALUES
  (1, '4 Lessons', 4, 2000.00, 30, true),
  (2, '8 Lessons', 8, 3600.00, 45, true),
  (3, '12 Lessons', 12, 5000.00, 60, true),
  (4, 'Trial (1 Lesson)', 1, 600.00, 14, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  lessons_count = EXCLUDED.lessons_count,
  price = EXCLUDED.price,
  valid_days = EXCLUDED.valid_days;

-- Subscriptions
INSERT INTO subscriptions (id, user_id, package_id, lessons_total, lessons_used, status, starts_at, expires_at, child_id, subscription_type, max_freezes, freezes_used)
VALUES
  ('s0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 2, 8, 3, 'active', NOW() - interval '15 days', NOW() + interval '30 days', 'c0000000-0000-0000-0000-000000000001', 'regular', 2, 0),
  ('s0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 3, 12, 7, 'active', NOW() - interval '30 days', NOW() + interval '30 days', 'c0000000-0000-0000-0000-000000000003', 'regular', 3, 1),
  ('s0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 1, 4, 4, 'expired', NOW() - interval '45 days', NOW() - interval '15 days', 'c0000000-0000-0000-0000-000000000004', 'regular', 1, 0),
  ('s0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 2, 8, 1, 'active', NOW() - interval '5 days', NOW() + interval '40 days', 'c0000000-0000-0000-0000-000000000005', 'regular', 2, 0),
  ('s0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 4, 1, 0, 'active', NOW(), NOW() + interval '14 days', 'c0000000-0000-0000-0000-000000000006', 'trial', 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Generate sessions for next 2 weeks using templates
-- We manually insert sample sessions based on the schedule_templates already in migration 0005
DO $$
DECLARE
  v_date date;
  v_dow int;
  v_tmpl record;
  v_session_id uuid;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
BEGIN
  -- Generate for next 14 days
  FOR i IN 0..13 LOOP
    v_date := CURRENT_DATE + i;
    v_dow := EXTRACT(DOW FROM v_date)::int;
    -- Convert to our 0=Mon format: Postgres DOW is 0=Sun,1=Mon,...6=Sat
    v_dow := CASE WHEN v_dow = 0 THEN 6 ELSE v_dow - 1 END;

    FOR v_tmpl IN
      SELECT st.*, ct.max_capacity as ct_capacity
      FROM schedule_templates st
      JOIN class_types ct ON ct.id = st.class_type_id
      WHERE st.day_of_week = v_dow AND st.is_active = true
    LOOP
      v_starts_at := v_date + v_tmpl.start_time;
      v_ends_at := v_date + v_tmpl.end_time;
      v_session_id := gen_random_uuid();

      INSERT INTO class_sessions (id, class_type_id, template_id, starts_at, ends_at, max_capacity, enrolled_count, status)
      VALUES (
        v_session_id,
        v_tmpl.class_type_id,
        v_tmpl.id,
        v_starts_at,
        v_ends_at,
        COALESCE(v_tmpl.max_capacity, v_tmpl.ct_capacity),
        0,
        'scheduled'
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Sample enrollments (book some children into upcoming sessions)
DO $$
DECLARE
  v_session record;
  v_count int := 0;
BEGIN
  FOR v_session IN
    SELECT id, max_capacity FROM class_sessions 
    WHERE starts_at > NOW() AND status = 'scheduled'
    ORDER BY starts_at
    LIMIT 10
  LOOP
    -- Enroll first parent's child
    IF v_count < 5 THEN
      INSERT INTO enrollments (id, session_id, user_id, child_id, subscription_id, status, booked_at)
      VALUES (
        gen_random_uuid(),
        v_session.id,
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        's0000000-0000-0000-0000-000000000001',
        'confirmed',
        NOW()
      )
      ON CONFLICT DO NOTHING;
    END IF;

    -- Enroll second parent's child (alternate sessions)
    IF v_count % 2 = 0 THEN
      INSERT INTO enrollments (id, session_id, user_id, child_id, subscription_id, status, booked_at)
      VALUES (
        gen_random_uuid(),
        v_session.id,
        'a0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000003',
        's0000000-0000-0000-0000-000000000002',
        'confirmed',
        NOW()
      )
      ON CONFLICT DO NOTHING;
    END IF;

    v_count := v_count + 1;
  END LOOP;
END $$;

-- Sample notifications
INSERT INTO notifications (id, user_id, type, title, body, read_at)
VALUES
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'booking_confirmed', 'Class Booked!', 'Elif is enrolled in Painting class on Monday at 10:00', NULL),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'session_reminder', 'Class Tomorrow', 'Reminder: Painting class tomorrow at 10:00', NULL),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002', 'booking_confirmed', 'Запись подтверждена', 'Misha записан на урок рисования в понедельник в 10:00', NOW() - interval '2 days'),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002', 'subscription_expiring', 'Абонемент истекает', 'Ваш абонемент на 12 занятий истекает через 30 дней', NULL)
ON CONFLICT DO NOTHING;

-- Studio settings should already exist from migration 0005
-- Verify they exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM studio_settings LIMIT 1) THEN
    RAISE NOTICE 'WARNING: studio_settings is empty. Run migration 0005 first.';
  END IF;
END $$;
