/*
# Kaza: Notary Digital Register - Initial Schema

1. New Tables

## offices
- `id` (uuid, primary key) - unique office identifier
- `name` (varchar 255) - office/firm display name
- `momo_code` (varchar 20) - mobile money code for payments
- `subscription_expires_at` (timestamptz) - trial/subscription expiry, defaults to 14 days from creation
- `account_status` (varchar 50) - one of: Active, Suspended, Trial
- `created_at` (timestamptz) - record creation timestamp

## client_logs
- `id` (uuid, primary key) - unique client log entry
- `client_number` (bigint, auto-generated via sequence) - sequential desk ordering number
- `office_id` (uuid, FK → offices) - owning office
- `token` (varchar 100, unique) - cryptographic single-use QR token
- `full_name` (varchar 255) - client full name
- `phone_number` (varchar 20) - client phone number
- `national_id` (varchar 16, optional) - 16-digit national ID with regex validation
- `service_type` (varchar 100) - type of notary service (Land Transfer, Will, etc.)
- `residential_address` (text, optional) - client residential address
- `signature_base64` (text, optional) - compressed signature vector storage
- `status` (varchar 50) - one of: Pending, Filing Details, Ready, Archived
- `created_at` (timestamptz) - record creation timestamp

## analytics_snapshots
- `id` (uuid, primary key)
- `office_id` (uuid, FK → offices)
- `snapshot_date` (date) - the day for this snapshot
- `total_documents_processed` (int) - count of processed docs that day
- `average_wait_minutes` (int) - average queue wait time in minutes
- unique constraint on (office_id, snapshot_date) to prevent duplicate daily entries

2. Security
- RLS enabled on all three tables
- Single-tenant no-auth app: policies use TO anon, authenticated with USING (true)
  so the anon-key frontend can read and write freely

3. Performance Indexes
- idx_client_logs_office_status on client_logs(office_id, status) for filtered queue queries
- idx_client_logs_token on client_logs(token) for QR code lookups
- idx_client_logs_created_at on client_logs(created_at DESC) for chronological listing
*/

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. OFFICES TABLE
CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  momo_code VARCHAR(20),
  subscription_expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  account_status VARCHAR(50) DEFAULT 'Active' CHECK (account_status IN ('Active', 'Suspended', 'Trial')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE offices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_offices" ON offices;
CREATE POLICY "anon_select_offices" ON offices FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_offices" ON offices;
CREATE POLICY "anon_insert_offices" ON offices FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_offices" ON offices;
CREATE POLICY "anon_update_offices" ON offices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_offices" ON offices;
CREATE POLICY "anon_delete_offices" ON offices FOR DELETE TO anon, authenticated USING (true);

-- 2. CLIENT LOGS TABLE
CREATE SEQUENCE IF NOT EXISTS client_number_seq START 40;

CREATE TABLE IF NOT EXISTS client_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_number BIGINT DEFAULT nextval('client_number_seq'),
  office_id UUID REFERENCES offices(id) ON DELETE CASCADE NOT NULL,
  token VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  national_id VARCHAR(16) CHECK (national_id ~ '^[0-9]{16}$' OR national_id IS NULL),
  service_type VARCHAR(100),
  residential_address TEXT,
  signature_base64 TEXT,
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Filing Details', 'Ready', 'Archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE client_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_client_logs" ON client_logs;
CREATE POLICY "anon_select_client_logs" ON client_logs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_client_logs" ON client_logs;
CREATE POLICY "anon_insert_client_logs" ON client_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_client_logs" ON client_logs;
CREATE POLICY "anon_update_client_logs" ON client_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_client_logs" ON client_logs;
CREATE POLICY "anon_delete_client_logs" ON client_logs FOR DELETE TO anon, authenticated USING (true);

-- 3. ANALYTICS SNAPSHOTS TABLE
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  office_id UUID REFERENCES offices(id) ON DELETE CASCADE NOT NULL,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  total_documents_processed INT DEFAULT 0,
  average_wait_minutes INT DEFAULT 0,
  UNIQUE(office_id, snapshot_date)
);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_analytics" ON analytics_snapshots;
CREATE POLICY "anon_select_analytics" ON analytics_snapshots FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_analytics" ON analytics_snapshots;
CREATE POLICY "anon_insert_analytics" ON analytics_snapshots FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_analytics" ON analytics_snapshots;
CREATE POLICY "anon_update_analytics" ON analytics_snapshots FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_analytics" ON analytics_snapshots;
CREATE POLICY "anon_delete_analytics" ON analytics_snapshots FOR DELETE TO anon, authenticated USING (true);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_client_logs_office_status ON client_logs(office_id, status);
CREATE INDEX IF NOT EXISTS idx_client_logs_token ON client_logs(token);
CREATE INDEX IF NOT EXISTS idx_client_logs_created_at ON client_logs(created_at DESC);

-- SEED: default office so the app works immediately
INSERT INTO offices (id, name, account_status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Kaza Notary Office', 'Active')
ON CONFLICT (id) DO NOTHING;
