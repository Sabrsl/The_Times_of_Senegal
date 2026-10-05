-- Entity aliases table for handling name variants
CREATE TABLE IF NOT EXISTS entity_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'organization', 'place', 'event')),
  entity_id UUID NOT NULL,
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, alias)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entity_aliases_type ON entity_aliases(entity_type);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_entity ON entity_aliases(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_normalized ON entity_aliases(normalized_alias);

-- RLS policies
ALTER TABLE entity_aliases ENABLE ROW LEVEL SECURITY;

-- Public can read aliases
CREATE POLICY "Public can read entity aliases" ON entity_aliases FOR SELECT USING (true);

-- Authenticated users can manage aliases
CREATE POLICY "Authenticated can insert entity aliases" ON entity_aliases FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update entity aliases" ON entity_aliases FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete entity aliases" ON entity_aliases FOR DELETE USING (auth.role() = 'authenticated');
