-- Allow super_admin to insert profiles (for admin user creation)
DROP POLICY IF EXISTS "Super admin can insert profiles" ON profiles;
CREATE POLICY "Super admin can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
