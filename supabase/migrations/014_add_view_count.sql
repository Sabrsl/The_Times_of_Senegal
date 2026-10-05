-- Add view_count column to articles
ALTER TABLE articles ADD COLUMN view_count INTEGER DEFAULT 0;
