-- 0016 — fn_promote_waitlist never actually promoted anyone
--
-- The guard has been wrong since 0005:
--
--     SELECT * INTO next_in_queue FROM waitlist ... LIMIT 1;
--     IF next_in_queue IS NOT NULL THEN
--
-- For a RECORD, `IS NOT NULL` is only true when EVERY field is non-null — it is
-- row-wise, not a "did we find a row" test. A queued waitlist row always has
-- NULL offered_at and NULL expires_at, so the condition was always false and the
-- body never ran. No spot was ever offered and no 'waitlist_available'
-- notification was ever sent.
--
-- `IF FOUND` is the correct test: it reflects whether the SELECT INTO matched.
--
-- Caught by cancelling a booking on a full session and asserting the queued
-- entry moved to 'offered'; it stayed 'waiting'.

CREATE OR REPLACE FUNCTION fn_promote_waitlist()
RETURNS TRIGGER AS $$
DECLARE
  next_in_queue RECORD;
  offer_hours   NUMERIC;
  session_state TEXT;
  session_start TIMESTAMPTZ;
BEGIN
  IF OLD.status = 'confirmed' AND NEW.status IN ('cancelled','no_show') THEN
    SELECT status, starts_at INTO session_state, session_start
    FROM class_sessions WHERE id = NEW.session_id;

    -- Don't offer seats in a class that is cancelled or already under way.
    IF session_state IS DISTINCT FROM 'scheduled' OR session_start <= NOW() THEN
      RETURN NEW;
    END IF;

    SELECT * INTO next_in_queue FROM waitlist
    WHERE session_id = NEW.session_id AND status = 'waiting'
    ORDER BY position ASC LIMIT 1;

    -- FOUND, not `next_in_queue IS NOT NULL` — see header.
    IF FOUND THEN
      SELECT COALESCE(NULLIF(trim(both '"' from value::text), '')::NUMERIC, 2)
        INTO offer_hours
      FROM studio_settings WHERE key = 'waitlist_offer_hours';

      IF offer_hours IS NULL OR offer_hours <= 0 THEN
        offer_hours := 2;
      END IF;

      UPDATE waitlist SET
        status     = 'offered',
        offered_at = NOW(),
        expires_at = NOW() + (offer_hours * INTERVAL '1 hour')
      WHERE id = next_in_queue.id;

      INSERT INTO notifications (user_id, type, title, body, channel, link, metadata)
      VALUES (
        next_in_queue.user_id,
        'waitlist_available',
        'A spot opened up!',
        'A spot opened in your waitlisted class. Confirm within '
          || trim(to_char(offer_hours, 'FM999990.9')) || ' hours.',
        'in_app',
        '/my/classes',
        jsonb_build_object('session_id', NEW.session_id, 'waitlist_id', next_in_queue.id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
