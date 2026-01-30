-- Fix connection update policy
-- Problem: Policy compares auth.uid() directly to recipient_id, but recipient_id is members.id, not auth_user_id
-- Solution: Use a subquery to match auth.uid() to the member's auth_user_id

-- Drop the old policy
DROP POLICY IF EXISTS "Recipients can update connection status" ON member_connections;

-- Create new policy that properly checks recipient via members table
CREATE POLICY "Recipients can update connection status" ON member_connections
FOR UPDATE
USING (
    recipient_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
);

-- Also allow requesters to update (for cases like canceling a request)
CREATE POLICY "Requesters can update connection status" ON member_connections
FOR UPDATE
USING (
    requester_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
);
