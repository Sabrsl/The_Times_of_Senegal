-- Create article_views table for precise view tracking
CREATE TABLE IF NOT EXISTS article_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, ip_address)
);

-- Enable RLS
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to insert views" ON article_views;
DROP POLICY IF EXISTS "Allow public to read views" ON article_views;

-- Allow public to insert views (for tracking)
CREATE POLICY "Allow public to insert views" ON article_views
  FOR INSERT WITH CHECK (true);

-- Allow public to read views (optional, for analytics)
CREATE POLICY "Allow public to read views" ON article_views
  FOR SELECT USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_ip_address ON article_views(ip_address);
CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON article_views(viewed_at DESC);

-- Create function to increment view count with deduplication
CREATE OR REPLACE FUNCTION increment_article_view(article_id_param UUID, ip_param TEXT)
RETURNS INTEGER AS $$
DECLARE
  view_count INTEGER;
BEGIN
  -- Try to insert the view record (will fail if already viewed from this IP)
  INSERT INTO article_views (article_id, ip_address)
  VALUES (article_id_param, ip_param)
  ON CONFLICT (article_id, ip_address) DO NOTHING;
  
  -- Update the view_count on the article
  UPDATE articles
  SET view_count = (
    SELECT COUNT(*)
    FROM article_views
    WHERE article_id = article_id_param
  )
  WHERE id = article_id_param;
  
  -- Return the new count
  RETURN (SELECT view_count FROM articles WHERE id = article_id_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on function to public
GRANT EXECUTE ON FUNCTION increment_article_view TO anon;
GRANT EXECUTE ON FUNCTION increment_article_view TO authenticated;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public to increment view_count" ON articles;

-- Allow public to update view_count on articles
CREATE POLICY "Allow public to increment view_count" ON articles
  FOR UPDATE USING (true)
  WITH CHECK (true);
