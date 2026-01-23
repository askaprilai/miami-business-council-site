// API endpoint to delete a member completely
// Removes both member profile and auth access
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Validate required fields
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  // Prevent deleting admin accounts
  const adminEmails = ['info@miamibusinesscouncil.com', 'sabral@me.com'];
  if (adminEmails.includes(email)) {
    return res.status(403).json({ error: 'Cannot delete admin accounts' });
  }

  try {
    console.log('🗑️ Deleting member:', email);

    // 1. Find the user by email in auth.users
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return res.status(500).json({ error: 'Failed to find user', details: listError.message });
    }

    const user = users.users.find(u => u.email === email);

    if (user) {
      // 2. Delete from auth.users (removes login access)
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

      if (authDeleteError) {
        console.error('Error deleting auth user:', authDeleteError);
        return res.status(500).json({ error: 'Failed to delete auth user', details: authDeleteError.message });
      }

      console.log('✅ Deleted auth user:', user.id);
    } else {
      console.log('⚠️ No auth user found for email:', email);
    }

    // 3. Delete from members table (member profile and data)
    const { error: memberDeleteError } = await supabaseAdmin
      .from('members')
      .delete()
      .eq('email', email);

    if (memberDeleteError) {
      console.error('Error deleting member:', memberDeleteError);
      return res.status(500).json({ error: 'Failed to delete member profile', details: memberDeleteError.message });
    }

    console.log('✅ Deleted member profile:', email);

    // 4. Delete any connections involving this member
    const { data: member } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('email', email)
      .single();

    if (member) {
      await supabaseAdmin
        .from('member_connections')
        .delete()
        .or(`requester_id.eq.${member.id},recipient_id.eq.${member.id}`);

      console.log('✅ Deleted member connections');
    }

    return res.status(200).json({
      success: true,
      message: `Member ${email} deleted completely. They can no longer log in.`
    });

  } catch (error) {
    console.error('Error deleting member:', error);
    return res.status(500).json({ error: 'Failed to delete member', details: error.message });
  }
}
