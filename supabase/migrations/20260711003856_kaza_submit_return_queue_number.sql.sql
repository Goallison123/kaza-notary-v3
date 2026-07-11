-- ─── Update submit_form_by_token to return queue_number + client_number ────
-- The client-side digital receipt needs the assigned number so the client
-- sees their queue token immediately on their phone screen.

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
    'category_name', v_cat_name,
    'queue_number', v_log.client_number,
    'office_name', (SELECT name FROM offices WHERE id = v_log.office_id),
    'service_type', COALESCE(v_cat_name, v_log.service_type, 'General'),
    'submitted_at', to_char(NOW() AT TIME ZONE 'Africa/Kigali', 'HH12:MI AM')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION submit_form_by_token(text, jsonb, text) TO anon, authenticated;
