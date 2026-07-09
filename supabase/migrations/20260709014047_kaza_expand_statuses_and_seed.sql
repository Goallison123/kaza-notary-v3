/*
# Kaza: Expand Client Status Types and Add Rich Seed Data

1. Changes
- Drops and re-creates the status CHECK constraint on client_logs to include
  'Signed & Recorded', 'Rejected', and 'Pending Verification' statuses
  (previously only: Pending, Filing Details, Ready, Archived)
- Inserts additional demo records with the full range of status values
  to populate the Records view realistically as shown in the design images

2. Important Notes
- The constraint is renamed for clarity: client_logs_status_check
- All existing data remains intact — only the constraint definition expands
- Seed inserts use ON CONFLICT DO NOTHING to be safely re-runnable
*/

-- Drop old status constraint and re-create with all 7 valid statuses
ALTER TABLE client_logs DROP CONSTRAINT IF EXISTS client_logs_status_check;

ALTER TABLE client_logs
  ADD CONSTRAINT client_logs_status_check
  CHECK (status IN (
    'Pending',
    'Filing Details',
    'Ready',
    'Archived',
    'Signed & Recorded',
    'Rejected',
    'Pending Verification'
  ));

-- Additional seed records matching the Records view design (Image 1)
INSERT INTO client_logs (office_id, token, full_name, phone_number, service_type, status, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'tok_rec001', 'Alice Uwase',        '+250 78 100 0001', 'Land Transfer',    'Signed & Recorded',   NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000001', 'tok_rec002', 'Samuel Bizimana',    '+250 78 100 0002', 'Will',             'Pending Verification', NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000001', 'tok_rec003', 'Jean Pierre Habimana','+250 78 100 0003','Power of Attorney', 'Pending Verification', NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000001', 'tok_rec004', 'Jean Pierre Habimana','+250 78 100 0004','Power of Attorney', 'Rejected',            NOW() - INTERVAL '6 days'),
  ('00000000-0000-0000-0000-000000000001', 'tok_rec005', 'Alvauel Bizimana',   '+250 78 100 0005', 'Land Transfer',    'Rejected',            NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000001', 'tok_rec006', 'Samuel Bizimana',    '+250 78 100 0006', 'Will',             'Rejected',            NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000001', 'tok_rec007', 'Alice Uwase',        '+250 78 100 0007', 'Land Transfer',    'Signed & Recorded',   NOW() - INTERVAL '4 days'),
  ('00000000-0000-0000-0000-000000000001', 'tok_rec008', 'Emmanuel Nkurunziza','+250 78 100 0008', 'Property Transfer','Signed & Recorded',   NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000001', 'tok_rec009', 'Marie Claire Uwase', '+250 78 100 0009', 'Affidavit',        'Pending Verification', NOW() - INTERVAL '2 days')
ON CONFLICT (token) DO NOTHING;
