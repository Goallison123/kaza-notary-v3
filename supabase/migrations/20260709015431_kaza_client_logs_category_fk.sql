/*
# Add category_id FK on client_logs → service_categories

The previous migration created service_categories after the DO block that
tried to add the FK. Now that service_categories exists, add the constraint.
*/
ALTER TABLE client_logs DROP CONSTRAINT IF EXISTS client_logs_category_id_fkey;
ALTER TABLE client_logs ADD CONSTRAINT client_logs_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL;
