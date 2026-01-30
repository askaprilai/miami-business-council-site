-- Fix activity_log RLS policies
-- Problem: When accepting connections, activity log entries fail due to RLS

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own activity" ON activity_log;
DROP POLICY IF EXISTS "Users can view their own activity" ON activity_log;
DROP POLICY IF EXISTS "Members can insert activity" ON activity_log;
DROP POLICY IF EXISTS "Members can view activity" ON activity_log;

-- Enable RLS if not already enabled
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert activity logs for their member_id
CREATE POLICY "Authenticated users can insert activity" ON activity_log
FOR INSERT
TO authenticated
WITH CHECK (
    member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
);

-- Allow users to view their own activity
CREATE POLICY "Users can view own activity" ON activity_log
FOR SELECT
TO authenticated
USING (
    member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
);

-- Allow users to view all activity (for activity feed)
CREATE POLICY "Users can view all activity" ON activity_log
FOR SELECT
TO authenticated
USING (true);
