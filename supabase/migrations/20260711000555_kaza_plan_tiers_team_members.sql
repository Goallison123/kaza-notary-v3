/*
# Kaza: Plan Tiers, Team Members, and Monthly Request Tracking

## Purpose
This migration implements the subscription tier system for Kaza. It adds plan tracking
columns to the offices table, creates a team_members table for the Professional tier's
team management feature, and sets up a monthly request counter for the Basic tier's
200-request-per-month limit.

## Changes to `offices` table
- `plan_tier` (varchar 50, default 'Free-Trial') — one of: Free-Trial, Basic, Professional, Enterprise.
  This is the primary tier switch. Admin can manually update this after confirming payment.
- `branch_count` (int, default 1) — number of office branches allowed per tier.
- `monthly_request_counter` (int, default 0) — counts QR code generations per month for Basic tier limit enforcement.
  Reset to 0 automatically on the 1st of each month via trigger.
- `monthly_counter_reset_at` (timestamptz) — tracks when the counter was last reset.

## New Table: `team_members`
- `id` (uuid, primary key)
- `office_id` (uuid, FK → offices) — the office this member belongs to
- `email` (text) — the email of the team member (for invitation tracking)
- `full_name` (text) — display name of the team member
- `role` (varchar 30, default 'staff') — one of: admin, staff
- `user_id` (uuid, nullable, FK → auth.users) — linked auth user once they accept the invite
- `status` (varchar 20, default 'invited') — one of: invited, active, removed
- `created_at` (timestamptz)

## Security
- RLS enabled on team_members
- Policies: anon + authenticated can CRUD (single-tenant app model, office-scoped via office_id)
- The app enforces tier-based limits in the frontend; the DB stores the source of truth

## Monthly Reset Trigger
- A trigger function `reset_monthly_counter()` checks if the current month differs from
  `monthly_counter_reset_at` month and resets `monthly_request_counter` to 0 if so.
- This trigger fires on every UPDATE of an office row, keeping the counter in sync without
  requiring a cron job.
*/

-- ─── Add plan tier columns to offices ────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offices' AND column_name = 'plan_tier') THEN
    ALTER TABLE offices
      ADD COLUMN plan_tier VARCHAR(50) DEFAULT 'Free-Trial'
      CHECK (plan_tier IN ('Free-Trial', 'Basic', 'Professional', 'Enterprise'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offices' AND column_name = 'branch_count') THEN
    ALTER TABLE offices ADD COLUMN branch_count INT DEFAULT 1;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offices' AND column_name = 'monthly_request_counter') THEN
    ALTER TABLE offices ADD COLUMN monthly_request_counter INT DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offices' AND column_name = 'monthly_counter_reset_at') THEN
    ALTER TABLE offices ADD COLUMN monthly_counter_reset_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ─── Create team_members table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  office_id UUID REFERENCES offices(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role VARCHAR(30) DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_team_members" ON team_members;
CREATE POLICY "anon_select_team_members" ON team_members FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_team_members" ON team_members;
CREATE POLICY "anon_insert_team_members" ON team_members FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_team_members" ON team_members;
CREATE POLICY "anon_update_team_members" ON team_members FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_team_members" ON team_members;
CREATE POLICY "anon_delete_team_members" ON team_members FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_team_members_office_id ON team_members(office_id);

-- ─── Monthly counter reset trigger ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION reset_monthly_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.monthly_counter_reset_at IS NULL
     OR date_trunc('month', NEW.monthly_counter_reset_at) < date_trunc('month', NOW()) THEN
    NEW.monthly_request_counter := 0;
    NEW.monthly_counter_reset_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reset_monthly_counter ON offices;
CREATE TRIGGER trigger_reset_monthly_counter
  BEFORE UPDATE ON offices
  FOR EACH ROW
  EXECUTE FUNCTION reset_monthly_counter();
