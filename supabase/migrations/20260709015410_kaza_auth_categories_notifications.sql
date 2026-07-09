/*
# Kaza: Auth, Dynamic Form Builder, Notifications

1. Schema Changes
  - offices: add user_id (auth.users FK) for per-user office isolation
  - client_logs: add category_id, form_data (jsonb), submitted_at, expires_at

2. New Tables
  - service_categories: admin-defined service types per office
  - category_fields: dynamic form fields per category (12 field types)
  - field_options: dropdown/radio/checkbox options per field
  - notifications: office-level activity feed

3. Security
  - All tables: RLS enabled, authenticated users scoped to their own office
  - Anon access: via SECURITY DEFINER RPC functions only (no direct table access)
  - Offices: user_id = auth.uid() ownership predicate

4. RPC Functions (SECURITY DEFINER — safe for anon)
  - get_form_by_token(token): returns form config for the scan page
  - submit_form_by_token(token, form_data, signature): submits the form

5. Important Notes
  - Existing seed data preserved (expires_at defaults to 7 days from now)
  - client_logs.service_type kept for backward compat; category_id is the new FK
  - field_options ordered by option_order for consistent rendering
*/

-- ─── offices: add user_id column ───────────────────────────────────────────
ALTER TABLE offices ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS for offices (auth-scoped)
DROP POLICY IF EXISTS "anon_select_offices" ON offices;
DROP POLICY IF EXISTS "anon_insert_offices" ON offices;
DROP POLICY IF EXISTS "anon_update_offices" ON offices;
DROP POLICY IF EXISTS "anon_delete_offices" ON offices;

DROP POLICY IF EXISTS "auth_select_offices" ON offices;
CREATE POLICY "auth_select_offices" ON offices FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "auth_insert_offices" ON offices;
CREATE POLICY "auth_insert_offices" ON offices FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "auth_update_offices" ON offices;
CREATE POLICY "auth_update_offices" ON offices FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "auth_delete_offices" ON offices;
CREATE POLICY "auth_delete_offices" ON offices FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ─── client_logs: add new columns ──────────────────────────────────────────
ALTER TABLE client_logs ADD COLUMN IF NOT EXISTS category_id UUID;
ALTER TABLE client_logs ADD COLUMN IF NOT EXISTS form_data JSONB;
ALTER TABLE client_logs ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
ALTER TABLE client_logs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days';

-- FK constraint (deferred add in case category_id column was just added)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'client_logs_category_id_fkey'
  ) THEN
    ALTER TABLE client_logs ADD CONSTRAINT client_logs_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Update RLS for client_logs (auth-scoped)
DROP POLICY IF EXISTS "anon_select_client_logs" ON client_logs;
DROP POLICY IF EXISTS "anon_insert_client_logs" ON client_logs;
DROP POLICY IF EXISTS "anon_update_client_logs" ON client_logs;
DROP POLICY IF EXISTS "anon_delete_client_logs" ON client_logs;

DROP POLICY IF EXISTS "auth_select_client_logs" ON client_logs;
CREATE POLICY "auth_select_client_logs" ON client_logs FOR SELECT
  TO authenticated USING (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "auth_insert_client_logs" ON client_logs;
CREATE POLICY "auth_insert_client_logs" ON client_logs FOR INSERT
  TO authenticated WITH CHECK (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "auth_update_client_logs" ON client_logs;
CREATE POLICY "auth_update_client_logs" ON client_logs FOR UPDATE
  TO authenticated USING (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  ) WITH CHECK (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "auth_delete_client_logs" ON client_logs;
CREATE POLICY "auth_delete_client_logs" ON client_logs FOR DELETE
  TO authenticated USING (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

-- ─── service_categories ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  office_id UUID REFERENCES offices(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_categories" ON service_categories;
CREATE POLICY "auth_select_categories" ON service_categories FOR SELECT
  TO authenticated USING (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "auth_insert_categories" ON service_categories;
CREATE POLICY "auth_insert_categories" ON service_categories FOR INSERT
  TO authenticated WITH CHECK (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "auth_update_categories" ON service_categories;
CREATE POLICY "auth_update_categories" ON service_categories FOR UPDATE
  TO authenticated USING (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  ) WITH CHECK (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "auth_delete_categories" ON service_categories;
CREATE POLICY "auth_delete_categories" ON service_categories FOR DELETE
  TO authenticated USING (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

-- ─── category_fields ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS category_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE NOT NULL,
  label VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'text','long_text','date','number','phone','email',
    'dropdown','radio','checkbox','national_id','file_upload','signature'
  )),
  placeholder VARCHAR(255),
  help_text TEXT,
  required BOOLEAN DEFAULT false,
  field_order INT DEFAULT 0,
  max_files INT DEFAULT 5,
  accepted_types TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE category_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_fields" ON category_fields;
CREATE POLICY "auth_select_fields" ON category_fields FOR SELECT
  TO authenticated USING (
    category_id IN (
      SELECT id FROM service_categories
      WHERE office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "auth_insert_fields" ON category_fields;
CREATE POLICY "auth_insert_fields" ON category_fields FOR INSERT
  TO authenticated WITH CHECK (
    category_id IN (
      SELECT id FROM service_categories
      WHERE office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "auth_update_fields" ON category_fields;
CREATE POLICY "auth_update_fields" ON category_fields FOR UPDATE
  TO authenticated USING (
    category_id IN (
      SELECT id FROM service_categories
      WHERE office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
    )
  ) WITH CHECK (
    category_id IN (
      SELECT id FROM service_categories
      WHERE office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "auth_delete_fields" ON category_fields;
CREATE POLICY "auth_delete_fields" ON category_fields FOR DELETE
  TO authenticated USING (
    category_id IN (
      SELECT id FROM service_categories
      WHERE office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
    )
  );

-- ─── field_options ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS field_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_id UUID REFERENCES category_fields(id) ON DELETE CASCADE NOT NULL,
  label VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  option_order INT DEFAULT 0
);

ALTER TABLE field_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_options" ON field_options;
CREATE POLICY "auth_select_options" ON field_options FOR SELECT
  TO authenticated USING (
    field_id IN (
      SELECT id FROM category_fields WHERE category_id IN (
        SELECT id FROM service_categories
        WHERE office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "auth_insert_options" ON field_options;
CREATE POLICY "auth_insert_options" ON field_options FOR INSERT
  TO authenticated WITH CHECK (
    field_id IN (
      SELECT id FROM category_fields WHERE category_id IN (
        SELECT id FROM service_categories
        WHERE office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "auth_update_options" ON field_options;
CREATE POLICY "auth_update_options" ON field_options FOR UPDATE
  TO authenticated USING (
    field_id IN (
      SELECT id FROM category_fields WHERE category_id IN (
        SELECT id FROM service_categories
        WHERE office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
      )
    )
  ) WITH CHECK (
    field_id IN (
      SELECT id FROM category_fields WHERE category_id IN (
        SELECT id FROM service_categories
        WHERE office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "auth_delete_options" ON field_options;
CREATE POLICY "auth_delete_options" ON field_options FOR DELETE
  TO authenticated USING (
    field_id IN (
      SELECT id FROM category_fields WHERE category_id IN (
        SELECT id FROM service_categories
        WHERE office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
      )
    )
  );

-- ─── notifications ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  office_id UUID REFERENCES offices(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_notifications" ON notifications;
CREATE POLICY "auth_select_notifications" ON notifications FOR SELECT
  TO authenticated USING (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "auth_update_notifications" ON notifications;
CREATE POLICY "auth_update_notifications" ON notifications FOR UPDATE
  TO authenticated USING (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  ) WITH CHECK (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "auth_delete_notifications" ON notifications;
CREATE POLICY "auth_delete_notifications" ON notifications FOR DELETE
  TO authenticated USING (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_categories_office ON service_categories(office_id);
CREATE INDEX IF NOT EXISTS idx_category_fields_category ON category_fields(category_id, field_order);
CREATE INDEX IF NOT EXISTS idx_field_options_field ON field_options(field_id, option_order);
CREATE INDEX IF NOT EXISTS idx_notifications_office ON notifications(office_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_logs_category ON client_logs(category_id);

-- ─── RPC: get_form_by_token (safe anon access via SECURITY DEFINER) ─────────
CREATE OR REPLACE FUNCTION get_form_by_token(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log client_logs;
  v_fields json;
BEGIN
  SELECT * INTO v_log FROM client_logs WHERE token = p_token;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'not_found');
  END IF;
  IF v_log.status IN ('Archived', 'Signed & Recorded') THEN
    RETURN json_build_object('error', 'already_submitted', 'client_name', v_log.full_name);
  END IF;
  IF v_log.expires_at IS NOT NULL AND v_log.expires_at < NOW() THEN
    RETURN json_build_object('error', 'expired', 'expires_at', v_log.expires_at);
  END IF;

  SELECT json_agg(
    json_build_object(
      'id', f.id,
      'label', f.label,
      'type', f.type,
      'placeholder', f.placeholder,
      'help_text', f.help_text,
      'required', f.required,
      'field_order', f.field_order,
      'max_files', f.max_files,
      'accepted_types', f.accepted_types,
      'options', (
        SELECT COALESCE(json_agg(
          json_build_object('id', o.id, 'label', o.label, 'value', o.value)
          ORDER BY o.option_order
        ), '[]'::json)
        FROM field_options o WHERE o.field_id = f.id
      )
    ) ORDER BY f.field_order
  ) INTO v_fields
  FROM category_fields f
  WHERE f.category_id = v_log.category_id;

  RETURN json_build_object(
    'token', v_log.token,
    'client_name', v_log.full_name,
    'status', v_log.status,
    'expires_at', v_log.expires_at,
    'category_name', COALESCE((SELECT name FROM service_categories WHERE id = v_log.category_id), v_log.service_type, 'Document Form'),
    'category_description', (SELECT description FROM service_categories WHERE id = v_log.category_id),
    'office_name', (SELECT name FROM offices WHERE id = v_log.office_id),
    'fields', COALESCE(v_fields, '[]'::json)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_form_by_token(text) TO anon, authenticated;

-- ─── RPC: submit_form_by_token ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION submit_form_by_token(
  p_token text,
  p_form_data jsonb,
  p_signature text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log client_logs;
  v_cat_name text;
BEGIN
  SELECT * INTO v_log FROM client_logs WHERE token = p_token FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'not_found');
  END IF;
  IF v_log.status NOT IN ('Pending', 'Filing Details') THEN
    RETURN json_build_object('success', false, 'error', 'already_submitted');
  END IF;
  IF v_log.expires_at IS NOT NULL AND v_log.expires_at < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'expired');
  END IF;

  SELECT COALESCE(name, v_log.service_type, 'Document Form')
    INTO v_cat_name FROM service_categories WHERE id = v_log.category_id;

  UPDATE client_logs SET
    form_data = p_form_data,
    signature_base64 = p_signature,
    status = 'Filing Details',
    submitted_at = NOW()
  WHERE token = p_token;

  INSERT INTO notifications (office_id, title, body, type)
  VALUES (
    v_log.office_id,
    'New form submission',
    format('%s submitted the %s form', v_log.full_name, v_cat_name),
    'success'
  );

  RETURN json_build_object(
    'success', true,
    'client_name', v_log.full_name,
    'category_name', v_cat_name
  );
END;
$$;

GRANT EXECUTE ON FUNCTION submit_form_by_token(text, jsonb, text) TO anon, authenticated;
