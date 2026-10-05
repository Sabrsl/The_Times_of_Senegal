-- Ensure dossiers table has correct columns
-- This migration ensures featured_image, is_visible, and position columns exist

ALTER TABLE dossiers 
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
