-- Make time_in nullable temporarily to import data
ALTER TABLE quotations ALTER COLUMN time_in DROP NOT NULL;

-- Add quote_number and quoted_date columns if they don't exist
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS quote_number TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS quoted_date DATE;