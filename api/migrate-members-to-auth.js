/**
 * Miami Business Council - Member Migration Script
 * Migrates existing members from hardcoded credentials to Supabase Auth
 *
 * This script:
 * 1. Creates or updates member records in the database
 * 2. Creates Supabase Auth users using Admin API
 * 3. Links auth_user_id to member records
 * 4. Sends magic link invitation emails
 *
 * Usage: POST /api/migrate-members-to-auth
 * Run this ONCE after enabling Supabase Auth
 */

import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './supabase-config.js';

// Current members to migrate (from member-login.html)
const EXISTING_MEMBERS = [
  {
    email: 'info@miamibusinesscouncil.com',
    firstName: 'MBC',
    lastName: 'Admin',
    companyName: 'Miami Business Council',
    jobTitle: 'Administrator',
    isAdmin: true
  },
  {
    email: 'april@retailu.ca',
    firstName: 'April',
    lastName: 'Sabral',
    companyName: 'AskApril AI',
    jobTitle: 'Founder & CEO'
  },
  {
    email: 'sabral@me.com',
    firstName: 'Joy',
    lastName: 'Sabral',
    companyName: 'RetailU',
    jobTitle: 'Partner'
  },
  {
    email: 'atiba@themadyungroup.com',
    firstName: 'Atiba',
    lastName: 'Madyun',
    companyName: 'The Madyun Group',
    jobTitle: 'Principal'
  },
  {
    email: 'lubna@thelubnanajjar.com',
    firstName: 'Lubna',
    lastName: 'Najjar',
    companyName: 'The Lubna Najjar Group',
    jobTitle: 'Real Estate Advisor'
  },
  {
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'User',
    companyName: 'Test Company',
    jobTitle: 'Tester'
  }
];

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple auth check - only allow from admin
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized - Admin access required' });
  }

  try {
    // Create Supabase Admin client
    const supabaseAdmin = createClient(
      supabaseConfig.url,
      supabaseConfig.serviceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    console.log(`🚀 Starting migration of ${EXISTING_MEMBERS.length} members...`);

    for (const member of EXISTING_MEMBERS) {
      try {
        console.log(`\n📧 Processing: ${member.email}`);

        // Step 1: Create or update member record in database
        const { data: memberData, error: memberError } = await supabaseAdmin
          .from('members')
          .upsert({
            email: member.email,
            first_name: member.firstName,
            last_name: member.lastName,
            company_name: member.companyName,
            job_title: member.jobTitle,
            is_active: true
          }, {
            onConflict: 'email',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (memberError && memberError.code !== '23505') { // Ignore duplicate key errors
          throw new Error(`Failed to create member record: ${memberError.message}`);
        }

        console.log(`  ✅ Member record created/updated: ${memberData?.id || 'existing'}`);

        // Step 2: Create auth user and send magic link invitation
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: member.email,
          options: {
            redirectTo: 'https://miamibusinesscouncil.com/member-portal',
            data: {
              first_name: member.firstName,
              last_name: member.lastName,
              company_name: member.companyName
            }
          }
        });

        if (authError) {
          // Check if user already exists
          if (authError.message.includes('already registered')) {
            console.log(`  ℹ️  Auth user already exists, fetching user...`);

            // Get existing user
            const { data: existingUser, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
            if (fetchError) {
              throw new Error(`Failed to fetch users: ${fetchError.message}`);
            }

            const user = existingUser.users.find(u => u.email === member.email);
            if (user) {
              // Update member record with auth_user_id
              await supabaseAdmin
                .from('members')
                .update({ auth_user_id: user.id })
                .eq('email', member.email);

              console.log(`  ✅ Linked existing auth user: ${user.id}`);

              results.push({
                email: member.email,
                status: 'success',
                message: 'Linked to existing auth user',
                authUserId: user.id
              });
              successCount++;
              continue;
            }
          } else {
            throw new Error(`Failed to create auth user: ${authError.message}`);
          }
        }

        console.log(`  ✅ Auth user created, magic link generated`);
        console.log(`  📧 Magic link: ${authData.properties.action_link}`);

        // Step 3: The trigger will automatically link auth_user_id
        // But let's verify after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: updatedMember } = await supabaseAdmin
          .from('members')
          .select('auth_user_id')
          .eq('email', member.email)
          .single();

        console.log(`  ✅ Member linked to auth user: ${updatedMember?.auth_user_id || 'pending'}`);

        results.push({
          email: member.email,
          status: 'success',
          message: 'Migrated successfully, magic link sent',
          magicLink: authData.properties.action_link,
          authUserId: authData.user.id
        });

        successCount++;

      } catch (error) {
        console.error(`  ❌ Error migrating ${member.email}:`, error.message);
        results.push({
          email: member.email,
          status: 'error',
          message: error.message
        });
        errorCount++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Success: ${successCount}/${EXISTING_MEMBERS.length}`);
    console.log(`   Errors: ${errorCount}/${EXISTING_MEMBERS.length}`);

    return res.status(200).json({
      success: true,
      message: `Migration completed: ${successCount} successful, ${errorCount} errors`,
      results,
      summary: {
        total: EXISTING_MEMBERS.length,
        successful: successCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
