-- Drop audit triggers to fix article saving issues
DROP TRIGGER IF EXISTS audit_articles_trigger ON articles;
DROP TRIGGER IF EXISTS audit_dossiers_trigger ON dossiers;
DROP TRIGGER IF EXISTS audit_categories_trigger ON categories;
DROP TRIGGER IF EXISTS audit_people_trigger ON people;
DROP TRIGGER IF EXISTS audit_organizations_trigger ON organizations;
DROP TRIGGER IF EXISTS audit_places_trigger ON places;
DROP TRIGGER IF EXISTS audit_events_trigger ON events;
DROP TRIGGER IF EXISTS audit_sources_trigger ON sources;
DROP TRIGGER IF EXISTS audit_profiles_trigger ON profiles;
DROP TRIGGER IF EXISTS audit_navigation_items_trigger ON navigation_items;
DROP TRIGGER IF EXISTS audit_homepage_sections_trigger ON homepage_sections;
DROP TRIGGER IF EXISTS audit_site_settings_trigger ON site_settings;

DROP FUNCTION IF EXISTS audit_trigger_func();
