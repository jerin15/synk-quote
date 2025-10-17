-- Remove default temporarily
ALTER TABLE quotations ALTER COLUMN status DROP DEFAULT;

-- Convert column to text temporarily
ALTER TABLE quotations ALTER COLUMN status TYPE text;

-- Update confirmed to approved and hold to pending
UPDATE quotations SET status = 'approved' WHERE status = 'confirmed';
UPDATE quotations SET status = 'pending' WHERE status = 'hold';

-- Create new enum with only 4 statuses
CREATE TYPE quotation_status_new AS ENUM ('pending', 'quoted', 'approved', 'cancelled');

-- Update the column to use the new enum
ALTER TABLE quotations ALTER COLUMN status TYPE quotation_status_new USING status::text::quotation_status_new;

-- Drop old enum and rename new one
DROP TYPE quotation_status;
ALTER TYPE quotation_status_new RENAME TO quotation_status;

-- Add back the default
ALTER TABLE quotations ALTER COLUMN status SET DEFAULT 'pending'::quotation_status;