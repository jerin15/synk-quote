-- Update all regret status to cancelled
UPDATE quotations SET status = 'cancelled' WHERE status = 'regret';

-- Remove default temporarily
ALTER TABLE quotations ALTER COLUMN status DROP DEFAULT;

-- Create new enum without delivered and regret
CREATE TYPE quotation_status_new AS ENUM ('pending', 'quoted', 'confirmed', 'cancelled', 'hold');

-- Update the column to use the new enum
ALTER TABLE quotations ALTER COLUMN status TYPE quotation_status_new USING status::text::quotation_status_new;

-- Drop old enum and rename new one
DROP TYPE quotation_status;
ALTER TYPE quotation_status_new RENAME TO quotation_status;

-- Add back the default
ALTER TABLE quotations ALTER COLUMN status SET DEFAULT 'pending'::quotation_status;