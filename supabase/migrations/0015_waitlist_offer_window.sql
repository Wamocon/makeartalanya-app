-- 0015 — Honour the waitlist_offer_hours studio setting
--
-- fn_promote_waitlist hardcoded `INTERVAL '2 hours'` while studio_settings
-- carried a `waitlist_offer_hours` key that the admin Settings screen lets staff
-- edit. Changing it in the UI had no effect on anything.
--
-- Also stops the promotion from firing on sessions the studio has cancelled —
-- offering a seat in a cancelled class and emailing someone about it is worse
-- than offering nothing.

CREATE OR REPLACE FUNCTION fn_promote_waitlist()
RETURNS TRIGGER AS $$
DECLARE
  next_in_queue RECORD;
  offer_hours   NUMERIC;
  session_state TEXT;
BEGIN
  IF OLD.status = 'confirmed' AND NEW.status IN ('cancelled','no_show') THEN
    SELECT status INTO session_state
    FROM class_sessions WHERE id = NEW.session_id;

    -- Nothing to offer if the class itself is off, or already in the past.
    IF session_state IS DISTINCT FROM 'scheduled' THEN
      RETURN NEW;
    END IF;

    IF EXISTS (
      SELECT 1 FROM class_sessions
      WHERE id = NEW.session_id AND starts_at <= NOW()
    ) THEN
      RETURN NEW;
    END IF;

    SELECT * INTO next_in_queue FROM waitlist
    WHERE session_id = NEW.session_id AND status = 'waiting'
    ORDER BY position ASC LIMIT 1;

    IF next_in_queue IS NOT NULL THEN
      SELECT COALESCE(NULLIF(value #>> '{}', '')::NUMERIC, 2)
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
