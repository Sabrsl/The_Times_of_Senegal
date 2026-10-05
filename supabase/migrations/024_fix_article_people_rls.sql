-- Allow authenticated users to manage article relationships and entities
-- This is a temporary fix to unblock the admin

DROP POLICY IF EXISTS "Editors and admins can manage article people" ON article_people;
CREATE POLICY "Authenticated can manage article people" ON article_people
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Editors and admins can manage article organizations" ON article_organizations;
CREATE POLICY "Authenticated can manage article organizations" ON article_organizations
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Editors and admins can manage article places" ON article_places;
CREATE POLICY "Authenticated can manage article places" ON article_places
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Editors and admins can manage article events" ON article_events;
CREATE POLICY "Authenticated can manage article events" ON article_events
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Editors and admins can manage dossier people" ON dossier_people;
CREATE POLICY "Authenticated can manage dossier people" ON dossier_people
  FOR ALL USING (auth.role() = 'authenticated');
