// Quick migration script to create auth users and send magic links
const https = require('https');

const SUPABASE_URL = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYzNTI0NiwiZXhwIjoyMDcxMjExMjQ2fQ.lC-ml2UXkRej1gUo2A8CaNhBaqkcnW-vXYj8y13_Nh8';

const MEMBERS = [
  { email: 'info@miamibusinesscouncil.com', firstName: 'MBC', lastName: 'Admin' },
  { email: 'april@retailu.ca', firstName: 'April', lastName: 'Sabral' },
  { email: 'sabral@me.com', firstName: 'Joy', lastName: 'Sabral' },
  { email: 'atiba@themadyungroup.com', firstName: 'Atiba', lastName: 'Madyun' },
  { email: 'lubna@thelubnanajjar.com', firstName: 'Lubna', lastName: 'Najjar' },
  { email: 'test@test.com', firstName: 'Test', lastName: 'User' }
];

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'vsnvtujkkkbjpuuwxvyd.supabase.co',
      path: path,
      method: method,
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function createAuthUser(member) {
  console.log(`\n📧 Creating auth user for: ${member.email}`);

  // Create user with Admin API
  const result = await makeRequest('/auth/v1/admin/users', 'POST', {
    email: member.email,
    email_confirm: true,
    user_metadata: {
      first_name: member.firstName,
      last_name: member.lastName
    }
  });

  if (result.status === 200 || result.status === 201) {
    console.log(`  ✅ Auth user created: ${result.data.id}`);

    // Link auth user to member record
    await makeRequest('/rest/v1/members', 'PATCH', {
      auth_user_id: result.data.id
    });

    // Generate magic link
    const linkResult = await makeRequest('/auth/v1/admin/generate_link', 'POST', {
      type: 'magiclink',
      email: member.email,
      options: {
        redirect_to: 'https://miamibusinesscouncil.com/member-portal'
      }
    });

    if (linkResult.status === 200) {
      console.log(`  ✅ Magic link generated!`);
      console.log(`  🔗 Link: ${linkResult.data.action_link}`);
      return { success: true, userId: result.data.id, magicLink: linkResult.data.action_link };
    }
  } else if (result.status === 422 && result.data.msg && result.data.msg.includes('already registered')) {
    console.log(`  ℹ️  User already exists, generating magic link...`);

    // Generate magic link for existing user
    const linkResult = await makeRequest('/auth/v1/admin/generate_link', 'POST', {
      type: 'magiclink',
      email: member.email,
      options: {
        redirect_to: 'https://miamibusinesscouncil.com/member-portal'
      }
    });

    if (linkResult.status === 200) {
      console.log(`  ✅ Magic link generated!`);
      console.log(`  🔗 Link: ${linkResult.data.action_link}`);
      return { success: true, magicLink: linkResult.data.action_link };
    }
  }

  console.log(`  ❌ Error: ${JSON.stringify(result.data)}`);
  return { success: false, error: result.data };
}

async function migrateAll() {
  console.log('🚀 Starting member migration to Supabase Auth...\n');
  console.log(`📋 Migrating ${MEMBERS.length} members:\n`);

  const results = [];

  for (const member of MEMBERS) {
    const result = await createAuthUser(member);
    results.push({ ...member, ...result });
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
  }

  console.log('\n\n📊 Migration Summary:');
  console.log('═'.repeat(80));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✅ Successful: ${successful.length}/${MEMBERS.length}`);
  console.log(`❌ Failed: ${failed.length}/${MEMBERS.length}\n`);

  if (successful.length > 0) {
    console.log('\n🔗 Magic Links Generated:');
    console.log('─'.repeat(80));
    successful.forEach(m => {
      if (m.magicLink) {
        console.log(`\n${m.email}:`);
        console.log(`${m.magicLink}`);
      }
    });
  }

  if (failed.length > 0) {
    console.log('\n\n❌ Failed Members:');
    failed.forEach(m => {
      console.log(`  - ${m.email}: ${JSON.stringify(m.error)}`);
    });
  }

  console.log('\n\n✅ Migration complete! Members can now log in with magic links.');
  console.log('📧 Send the magic links to each member via email.\n');
}

migrateAll().catch(console.error);
