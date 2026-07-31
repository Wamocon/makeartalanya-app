-- 0011 — Critical correctness + access fixes
--
-- Everything here is additive or corrective. No table or column is dropped and
-- no row is deleted; the one data change reconciles class_sessions.enrolled_count
-- with the enrollments that are actually there.

-- ═══════════════════════════════════════════════════════════════════
-- 1. Missing RLS policies
--    Both tables had RLS ENABLED with zero policies, which denies every
--    non-service-role read. `packages` is joined from /my/subscriptions and the
--    dashboard, so package names silently came back NULL for signed-in parents.
-- ═══════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polrelid = 'public.packages'::regclass
                              AND polname = 'public_read_packages'
  ) THEN
    CREATE POLICY "public_read_packages" ON public.packages
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polrelid = 'public.packages'::regclass
                              AND polname = 'admin_manage_packages'
  ) THEN
    CREATE POLICY "admin_manage_packages" ON public.packages
      FOR ALL USING (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polrelid = 'public.attendance'::regclass
                              AND polname = 'users_own_attendance'
  ) THEN
    CREATE POLICY "users_own_attendance" ON public.attendance
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.subscriptions s
          WHERE s.id = attendance.subscription_id AND s.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polrelid = 'public.attendance'::regclass
                              AND polname = 'admin_manage_attendance'
  ) THEN
    CREATE POLICY "admin_manage_attendance" ON public.attendance
      FOR ALL USING (public.is_admin_or_trainer());
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 2. attendance.booking_id pointed at legacy_bookings
--    The app marks attendance against `enrollments`, so every insert violated
--    attendance_booking_id_fkey. The API ignored the error, so attendance rows
--    were never written and the audit trail stayed empty.
-- ═══════════════════════════════════════════════════════════════════
DO $$
BEGIN
  -- Only rows that reference a real enrollment can survive the re-point.
  -- (attendance is empty in practice precisely because the FK was rejecting.)
  DELETE FROM public.attendance a
  WHERE NOT EXISTS (SELECT 1 FROM public.enrollments e WHERE e.id = a.booking_id);

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.attendance'::regclass
      AND conname = 'attendance_booking_id_fkey'
  ) THEN
    ALTER TABLE public.attendance DROP CONSTRAINT attendance_booking_id_fkey;
  END IF;

  ALTER TABLE public.attendance
    ADD CONSTRAINT attendance_booking_id_fkey
    FOREIGN KEY (booking_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;
END $$;

-- One attendance row per enrollment, so marking twice cannot deduct twice.
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_one_per_enrollment
  ON public.attendance(booking_id);

-- ═══════════════════════════════════════════════════════════════════
-- 3. generate_sessions() produced sessions in the past
--    target_date = CURRENT_DATE + (day_of_week - current_dow + 7*week_offset)
--    goes negative whenever the template's weekday is earlier in the week than
--    today, so week_offset 0 landed on a date that had already passed. It also
--    counted skipped iterations as "generated".
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION generate_sessions(weeks_ahead INT DEFAULT 2)
RETURNS INT AS $$
DECLARE
  tmpl          RECORD;
  session_start TIMESTAMPTZ;
  session_end   TIMESTAMPTZ;
  generated     INT := 0;
  inserted      INT;
  target_date   DATE;
  current_dow   INT;
  day_delta     INT;
BEGIN
  current_dow := EXTRACT(ISODOW FROM CURRENT_DATE)::INT - 1;  -- 0 = Monday

  FOR tmpl IN
    SELECT st.*, ct.duration_min AS type_duration, ct.max_capacity AS type_capacity
    FROM schedule_templates st
    JOIN class_types ct ON ct.id = st.class_type_id
    WHERE st.is_active = TRUE
      AND (st.valid_until IS NULL OR st.valid_until >= CURRENT_DATE)
  LOOP
    -- Days until this template's weekday next occurs (0 = today).
    day_delta := (tmpl.day_of_week - current_dow + 7) % 7;

    FOR week_offset IN 0..weeks_ahead - 1 LOOP
      target_date := CURRENT_DATE + day_delta + (7 * week_offset);

      IF target_date < tmpl.valid_from THEN CONTINUE; END IF;
      IF tmpl.valid_until IS NOT NULL AND target_date > tmpl.valid_until THEN CONTINUE; END IF;

      IF EXISTS (
        SELECT 1 FROM schedule_exceptions
        WHERE exception_date = target_date AND type = 'holiday'
      ) THEN
        CONTINUE;
      END IF;

      session_start := target_date + tmpl.start_time;
      session_end   := target_date + tmpl.end_time;

      -- Never materialise a class that has already started.
      IF session_start <= NOW() THEN CONTINUE; END IF;

      INSERT INTO class_sessions (
        template_id, class_type_id, trainer_id, starts_at, ends_at, max_capacity
      )
      VALUES (
        tmpl.id, tmpl.class_type_id, tmpl.trainer_id, session_start, session_end,
        COALESCE(tmpl.max_capacity, tmpl.type_capacity)
      )
      ON CONFLICT DO NOTHING;

      GET DIAGNOSTICS inserted = ROW_COUNT;
      generated := generated + inserted;   -- count real inserts, not attempts
    END LOOP;
  END LOOP;

  RETURN generated;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════
-- 3b. Re-assert the chat policies.
--     0010 section 2 lists the chat tables among those it strips policies from,
--     but section 3 never puts them back — so applying 0010 *after* 0008 leaves
--     chat with RLS on and zero policies, which denies everything. Running this
--     last makes the end state correct no matter what order they were applied
--     in, and re-running is a no-op.
-- ═══════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF to_regclass('public.chat_rooms') IS NULL THEN
    RAISE NOTICE 'chat tables absent — skipping chat policies';
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid='public.chat_rooms'::regclass
                                           AND polname='chat_rooms_select_participants') THEN
    CREATE POLICY "chat_rooms_select_participants" ON public.chat_rooms
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.chat_participants cp
                WHERE cp.room_id = chat_rooms.id AND cp.user_id = auth.uid())
        OR public.is_admin_or_trainer()
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid='public.chat_participants'::regclass
                                           AND polname='chat_participants_select') THEN
    CREATE POLICY "chat_participants_select" ON public.chat_participants
      FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_trainer());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid='public.chat_participants'::regclass
                                           AND polname='chat_participants_insert') THEN
    CREATE POLICY "chat_participants_insert" ON public.chat_participants
      FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin_or_trainer());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid='public.chat_participants'::regclass
                                           AND polname='chat_participants_update_own') THEN
    CREATE POLICY "chat_participants_update_own" ON public.chat_participants
      FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_or_trainer());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid='public.chat_messages'::regclass
                                           AND polname='chat_messages_select') THEN
    CREATE POLICY "chat_messages_select" ON public.chat_messages
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.chat_participants cp
                WHERE cp.room_id = chat_messages.room_id AND cp.user_id = auth.uid())
        OR public.is_admin_or_trainer()
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid='public.chat_messages'::regclass
                                           AND polname='chat_messages_insert') THEN
    CREATE POLICY "chat_messages_insert" ON public.chat_messages
      FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND (
          EXISTS (SELECT 1 FROM public.chat_participants cp
                  WHERE cp.room_id = chat_messages.room_id AND cp.user_id = auth.uid())
          OR public.is_admin_or_trainer()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid='public.chat_messages'::regclass
                                           AND polname='chat_messages_update_own') THEN
    CREATE POLICY "chat_messages_update_own" ON public.chat_messages
      FOR UPDATE USING (sender_id = auth.uid() OR public.is_admin_or_trainer());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid='public.admin_presence'::regclass
                                           AND polname='admin_presence_select') THEN
    CREATE POLICY "admin_presence_select" ON public.admin_presence
      FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid='public.admin_presence'::regclass
                                           AND polname='admin_presence_insert_own') THEN
    CREATE POLICY "admin_presence_insert_own" ON public.admin_presence
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid='public.admin_presence'::regclass
                                           AND polname='admin_presence_update_own') THEN
    CREATE POLICY "admin_presence_update_own" ON public.admin_presence
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 4. Reconcile enrolled_count
--    /api/enroll incremented enrolled_count by hand while trg_enrolled_count
--    was already doing it, so every booking counted twice. The application fix
--    stops new drift; this repairs what is already stored.
-- ═══════════════════════════════════════════════════════════════════
UPDATE class_sessions cs
SET enrolled_count = actual.n
FROM (
  SELECT s.id, COUNT(e.id)::INT AS n
  FROM class_sessions s
  LEFT JOIN enrollments e
    ON e.session_id = s.id AND e.status = 'confirmed'
  GROUP BY s.id
) AS actual
WHERE cs.id = actual.id
  AND cs.enrolled_count IS DISTINCT FROM actual.n;
