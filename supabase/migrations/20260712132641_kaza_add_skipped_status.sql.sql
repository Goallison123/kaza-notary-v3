-- ─── Add Skipped status support ───────────────────────────────────────────
-- When a client is not available or late, the receptionist can skip them.
-- The client's phone shows a "Skipped" state with a Rejoin Queue button.
-- If they rejoin, they go back to Pending with a new position at the end.

ALTER TABLE client_logs ADD COLUMN IF NOT EXISTS skipped_at TIMESTAMPTZ;

-- Allow the Skipped status (the status column is text, so no constraint change needed)
-- but we add a trigger to set skipped_at automatically when status changes to 'Skipped'

CREATE OR REPLACE FUNCTION set_skipped_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'Skipped' AND OLD.status <> 'Skipped' THEN
    NEW.skipped_at = NOW();
  ELSIF NEW.status <> 'Skipped' THEN
    NEW.skipped_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_skipped_at ON client_logs;
CREATE TRIGGER trg_set_skipped_at
  BEFORE UPDATE ON client_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_skipped_at();

-- RLS: Skipped clients can still be seen by the office (already covered by existing policies)
-- No new policies needed since existing SELECT covers all statuses for the office.
