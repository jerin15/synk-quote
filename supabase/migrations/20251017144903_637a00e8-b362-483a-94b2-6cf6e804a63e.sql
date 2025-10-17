-- Update the quotation_status enum to match Excel sheet
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'hold';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'regret';

-- Note: We cannot remove 'cancelled' from the enum directly in PostgreSQL
-- Instead, we'll update all 'cancelled' entries to appropriate status
-- and document that 'cancelled' should not be used going forward