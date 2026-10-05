-- Update sources table to ensure all required fields exist
-- This migration ensures publisher and accessed_at fields are properly set up

-- The sources table already has these fields from initial schema:
-- publisher TEXT
-- accessed_at TIMESTAMP WITH TIME ZONE

-- This migration is for documentation purposes to confirm these fields are available
-- for the new Wikipedia-style source display format

-- Example of updating existing sources with default values if needed:
-- UPDATE sources SET publisher = COALESCE(publisher, 'Non spécifié') WHERE publisher IS NULL;
-- UPDATE sources SET accessed_at = COALESCE(accessed_at, NOW()) WHERE accessed_at IS NULL;
