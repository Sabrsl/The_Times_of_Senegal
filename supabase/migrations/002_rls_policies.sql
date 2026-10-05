-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossier_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES

-- Public can read profiles (for author info)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users cannot change their role (role changes only via service role)
DROP POLICY IF EXISTS "Users cannot change role" ON profiles;
CREATE POLICY "Users cannot change role" ON profiles
  FOR UPDATE WITH CHECK (
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- CATEGORIES POLICIES

-- Public can read visible categories
DROP POLICY IF EXISTS "Public can read visible categories" ON categories;
CREATE POLICY "Public can read visible categories" ON categories
  FOR SELECT USING (is_visible = true);

-- Editors and admins can read all categories
DROP POLICY IF EXISTS "Editors and admins can read all categories" ON categories;
CREATE POLICY "Editors and admins can read all categories" ON categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors and admins can insert categories
DROP POLICY IF EXISTS "Editors and admins can insert categories" ON categories;
CREATE POLICY "Editors and admins can insert categories" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors and admins can update categories
DROP POLICY IF EXISTS "Editors and admins can update categories" ON categories;
CREATE POLICY "Editors and admins can update categories" ON categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Admins and super_admins can delete categories
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
CREATE POLICY "Admins can delete categories" ON categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ARTICLES POLICIES

-- Public can read published articles
DROP POLICY IF EXISTS "Public can read published articles" ON articles;
CREATE POLICY "Public can read published articles" ON articles
  FOR SELECT USING (status = 'published');

-- Editors and admins can read all articles
DROP POLICY IF EXISTS "Editors and admins can read all articles" ON articles;
CREATE POLICY "Editors and admins can read all articles" ON articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors and admins can insert articles
DROP POLICY IF EXISTS "Editors and admins can insert articles" ON articles;
CREATE POLICY "Editors and admins can insert articles" ON articles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors can update their own articles
DROP POLICY IF EXISTS "Editors can update own articles" ON articles;
CREATE POLICY "Editors can update own articles" ON articles
  FOR UPDATE USING (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Admins can update any article
DROP POLICY IF EXISTS "Admins can update any article" ON articles;
CREATE POLICY "Admins can update any article" ON articles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins and super_admins can delete articles
DROP POLICY IF EXISTS "Admins can delete articles" ON articles;
CREATE POLICY "Admins can delete articles" ON articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- DOSSIERS POLICIES

-- Public can read published dossiers
DROP POLICY IF EXISTS "Public can read published dossiers" ON dossiers;
CREATE POLICY "Public can read published dossiers" ON dossiers
  FOR SELECT USING (status = 'published');

-- Editors and admins can read all dossiers
DROP POLICY IF EXISTS "Editors and admins can read all dossiers" ON dossiers;
CREATE POLICY "Editors and admins can read all dossiers" ON dossiers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors and admins can insert dossiers
DROP POLICY IF EXISTS "Editors and admins can insert dossiers" ON dossiers;
CREATE POLICY "Editors and admins can insert dossiers" ON dossiers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors and admins can update dossiers
DROP POLICY IF EXISTS "Editors and admins can update dossiers" ON dossiers;
CREATE POLICY "Editors and admins can update dossiers" ON dossiers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Admins and super_admins can delete dossiers
DROP POLICY IF EXISTS "Admins can delete dossiers" ON dossiers;
CREATE POLICY "Admins can delete dossiers" ON dossiers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- DOSSIER_ARTICLES POLICIES

-- Public can read dossier articles for published dossiers
DROP POLICY IF EXISTS "Public can read dossier articles" ON dossier_articles;
CREATE POLICY "Public can read dossier articles" ON dossier_articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = dossier_articles.dossier_id AND dossiers.status = 'published'
    )
  );

-- Editors and admins can read all dossier articles
DROP POLICY IF EXISTS "Editors and admins can read all dossier articles" ON dossier_articles;
CREATE POLICY "Editors and admins can read all dossier articles" ON dossier_articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors and admins can insert dossier articles
DROP POLICY IF EXISTS "Editors and admins can insert dossier articles" ON dossier_articles;
CREATE POLICY "Editors and admins can insert dossier articles" ON dossier_articles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors and admins can update dossier articles
DROP POLICY IF EXISTS "Editors and admins can update dossier articles" ON dossier_articles;
CREATE POLICY "Editors and admins can update dossier articles" ON dossier_articles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors and admins can delete dossier articles
DROP POLICY IF EXISTS "Editors and admins can delete dossier articles" ON dossier_articles;
CREATE POLICY "Editors and admins can delete dossier articles" ON dossier_articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- PEOPLE POLICIES

-- Public can read people
DROP POLICY IF EXISTS "Public can read people" ON people;
CREATE POLICY "Public can read people" ON people
  FOR SELECT USING (true);

-- Editors and admins can insert people
DROP POLICY IF EXISTS "Editors and admins can insert people" ON people;
CREATE POLICY "Editors and admins can insert people" ON people
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors and admins can update people
DROP POLICY IF EXISTS "Editors and admins can update people" ON people;
CREATE POLICY "Editors and admins can update people" ON people
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Admins and super_admins can delete people
DROP POLICY IF EXISTS "Admins can delete people" ON people;
CREATE POLICY "Admins can delete people" ON people
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ORGANIZATIONS POLICIES

-- Public can read organizations
DROP POLICY IF EXISTS "Public can read organizations" ON organizations;
CREATE POLICY "Public can read organizations" ON organizations
  FOR SELECT USING (true);

-- Editors and admins can insert organizations
DROP POLICY IF EXISTS "Editors and admins can insert organizations" ON organizations;
CREATE POLICY "Editors and admins can insert organizations" ON organizations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors and admins can update organizations
DROP POLICY IF EXISTS "Editors and admins can update organizations" ON organizations;
CREATE POLICY "Editors and admins can update organizations" ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Admins and super_admins can delete organizations
DROP POLICY IF EXISTS "Admins can delete organizations" ON organizations;
CREATE POLICY "Admins can delete organizations" ON organizations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- PLACES POLICIES

-- Public can read places
DROP POLICY IF EXISTS "Public can read places" ON places;
CREATE POLICY "Public can read places" ON places
  FOR SELECT USING (true);

-- Editors and admins can insert places
DROP POLICY IF EXISTS "Editors and admins can insert places" ON places;
CREATE POLICY "Editors and admins can insert places" ON places
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors and admins can update places
DROP POLICY IF EXISTS "Editors and admins can update places" ON places;
CREATE POLICY "Editors and admins can update places" ON places
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Admins and super_admins can delete places
DROP POLICY IF EXISTS "Admins can delete places" ON places;
CREATE POLICY "Admins can delete places" ON places
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- EVENTS POLICIES

-- Public can read events
DROP POLICY IF EXISTS "Public can read events" ON events;
CREATE POLICY "Public can read events" ON events
  FOR SELECT USING (true);

-- Editors and admins can insert events
DROP POLICY IF EXISTS "Editors and admins can insert events" ON events;
CREATE POLICY "Editors and admins can insert events" ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors and admins can update events
DROP POLICY IF EXISTS "Editors and admins can update events" ON events;
CREATE POLICY "Editors and admins can update events" ON events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Admins and super_admins can delete events
DROP POLICY IF EXISTS "Admins can delete events" ON events;
CREATE POLICY "Admins can delete events" ON events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ARTICLE_RELATIONSHIP POLICIES (article_people, article_organizations, article_places, article_events)

-- Public can read entity relationships for published articles
DROP POLICY IF EXISTS "Public can read article people" ON article_people;
CREATE POLICY "Public can read article people" ON article_people
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.id = article_people.article_id AND articles.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Public can read article organizations" ON article_organizations;
CREATE POLICY "Public can read article organizations" ON article_organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.id = article_organizations.article_id AND articles.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Public can read article places" ON article_places;
CREATE POLICY "Public can read article places" ON article_places
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.id = article_places.article_id AND articles.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Public can read article events" ON article_events;
CREATE POLICY "Public can read article events" ON article_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.id = article_events.article_id AND articles.status = 'published'
    )
  );

-- Editors and admins can manage all relationships
DROP POLICY IF EXISTS "Editors and admins can manage article people" ON article_people;
CREATE POLICY "Editors and admins can manage article people" ON article_people
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Editors and admins can manage article organizations" ON article_organizations;
CREATE POLICY "Editors and admins can manage article organizations" ON article_organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Editors and admins can manage article places" ON article_places;
CREATE POLICY "Editors and admins can manage article places" ON article_places
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Editors and admins can manage article events" ON article_events;
CREATE POLICY "Editors and admins can manage article events" ON article_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- SOURCES POLICIES

-- Public can read sources
DROP POLICY IF EXISTS "Public can read sources" ON sources;
CREATE POLICY "Public can read sources" ON sources
  FOR SELECT USING (true);

-- Editors and admins can insert sources
DROP POLICY IF EXISTS "Editors and admins can insert sources" ON sources;
CREATE POLICY "Editors and admins can insert sources" ON sources
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Editors and admins can update sources
DROP POLICY IF EXISTS "Editors and admins can update sources" ON sources;
CREATE POLICY "Editors and admins can update sources" ON sources
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Admins and super_admins can delete sources
DROP POLICY IF EXISTS "Admins can delete sources" ON sources;
CREATE POLICY "Admins can delete sources" ON sources
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ARTICLE_SOURCES POLICIES

-- Public can read article sources for published articles
DROP POLICY IF EXISTS "Public can read article sources" ON article_sources;
CREATE POLICY "Public can read article sources" ON article_sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.id = article_sources.article_id AND articles.status = 'published'
    )
  );

-- Editors and admins can manage article sources
DROP POLICY IF EXISTS "Editors and admins can manage article sources" ON article_sources;
CREATE POLICY "Editors and admins can manage article sources" ON article_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- NAVIGATION_ITEMS POLICIES

-- Public can read visible navigation items
DROP POLICY IF EXISTS "Public can read visible navigation" ON navigation_items;
CREATE POLICY "Public can read visible navigation" ON navigation_items
  FOR SELECT USING (is_visible = true);

-- Editors and admins can read all navigation items
DROP POLICY IF EXISTS "Editors and admins can read all navigation" ON navigation_items;
CREATE POLICY "Editors and admins can read all navigation" ON navigation_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Admins and super_admins can manage navigation
DROP POLICY IF EXISTS "Admins can manage navigation" ON navigation_items;
CREATE POLICY "Admins can manage navigation" ON navigation_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- HOMEPAGE_SECTIONS POLICIES

-- Public can read visible homepage sections
DROP POLICY IF EXISTS "Public can read visible homepage" ON homepage_sections;
CREATE POLICY "Public can read visible homepage" ON homepage_sections
  FOR SELECT USING (is_visible = true);

-- Editors and admins can read all homepage sections
DROP POLICY IF EXISTS "Editors and admins can read all homepage" ON homepage_sections;
CREATE POLICY "Editors and admins can read all homepage" ON homepage_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin')
    )
  );

-- Admins and super_admins can manage homepage sections
DROP POLICY IF EXISTS "Admins can manage homepage" ON homepage_sections;
CREATE POLICY "Admins can manage homepage" ON homepage_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- SITE_SETTINGS POLICIES

-- Public can read site settings
DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
CREATE POLICY "Public can read site settings" ON site_settings
  FOR SELECT USING (true);

-- Admins and super_admins can update site settings
DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
CREATE POLICY "Admins can update site settings" ON site_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- AUDIT_LOGS POLICIES

-- Only admins and super_admins can read audit logs
DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;
CREATE POLICY "Admins can read audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Only system can insert audit logs (via trigger or service role)
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (false);

-- Only super_admins can delete audit logs
DROP POLICY IF EXISTS "Super admins can delete audit logs" ON audit_logs;
CREATE POLICY "Super admins can delete audit logs" ON audit_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
