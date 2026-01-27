// Process new paid members: Create in database and send magic link
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      email,
      firstName,
      lastName,
      businessName,
      jobTitle,
      industry,
      phone,
      linkedIn,
      employeeCount,
      incorporated,
      interests,
      membershipType
    } = req.body;

    if (!email || !firstName || !lastName || !membershipType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Initialize Supabase admin client (service role key for admin operations)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return res.status(500).json({ error: 'Database configuration error' });
    }

    if (!resendApiKey) {
      console.error('Missing Resend API key');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Step 1: Create or get Supabase auth user
    console.log(`Creating auth user for ${email}...`);

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      email_confirm: true, // Auto-confirm email since they've paid
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        membership_type: membershipType,
        onboarding_completed: false
      }
    });

    if (authError) {
      // If user already exists, that's okay - we'll use the existing auth account
      if (authError.message.includes('already registered')) {
        console.log('Auth user already exists, continuing...');
        const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email.toLowerCase());
        if (!existingUser) {
          throw new Error('Could not find or create auth user');
        }
        authData.user = existingUser.user;
      } else {
        console.error('Auth creation error:', authError);
        throw authError;
      }
    }

    const authUserId = authData.user.id;
    console.log(`Auth user created/found: ${authUserId}`);

    // Step 2: Create member record in database
    console.log('Creating member record in database...');

    const memberData = {
      auth_user_id: authUserId,
      email: email.toLowerCase(),
      first_name: firstName,
      last_name: lastName,
      company_name: businessName || null,
      job_title: jobTitle || null,
      industry: industry || null,
      phone: phone || null,
      linkedin_url: linkedIn || null,
      employee_count: employeeCount || null,
      incorporated_status: incorporated || null,
      interests: interests || null,
      membership_type: membershipType,
      membership_tier: 'paid',
      is_active: true,
      profile_completed: false,
      created_at: new Date().toISOString()
    };

    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .upsert(memberData, {
        onConflict: 'email',
        returning: 'representation'
      })
      .select()
      .single();

    if (memberError) {
      console.error('Member creation error:', memberError);
      // Try to clean up auth user if member creation failed
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      throw memberError;
    }

    console.log(`Member created: ${member.id}`);

    // Step 3: Generate magic link for portal access
    console.log('Generating magic link...');

    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
      options: {
        redirectTo: 'https://miamibusinesscouncil.com/portal'
      }
    });

    if (magicLinkError) {
      console.error('Magic link generation error:', magicLinkError);
      throw magicLinkError;
    }

    const magicLink = magicLinkData.properties.action_link;
    console.log('Magic link generated successfully');

    // Step 4: Send welcome email with magic link
    const membershipPricing = {
      'individual': '$250/year',
      'nonprofit': '$350/year',
      'business': '$450/year'
    };

    const membershipPrice = membershipPricing[membershipType] || 'Premium';
    const membershipLabel = membershipType.charAt(0).toUpperCase() + membershipType.slice(1);

    const welcomeEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
            <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 300;">🎉 Welcome to Miami Business Council!</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your ${membershipLabel} Membership is Active</p>
          </div>

          <!-- Payment Confirmation -->
          <div style="background: #e8f5e8; border: 2px solid #51cf66; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <h3 style="color: #2f9e44; margin: 0 0 10px 0;">✅ Payment Confirmed</h3>
            <p style="color: #2f9e44; margin: 0; font-size: 16px;">
              <strong>${membershipLabel} Membership</strong> • ${membershipPrice}
            </p>
          </div>

          <!-- Magic Link Access -->
          <div style="background: #fff3cd; border: 2px solid #d4af37; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #856404; margin-top: 0; margin-bottom: 20px;">🚀 Access Your Member Portal</h3>
            <p style="color: #333; margin-bottom: 20px; line-height: 1.6;">
              Click the button below to securely log into your exclusive member portal. No password needed - just one click!
            </p>

            <div style="text-align: center; margin: 25px 0;">
              <a href="${magicLink}" style="background: #d4af37; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 18px;">
                🔓 Access Portal Now
              </a>
            </div>

            <p style="color: #666; margin: 20px 0 0 0; font-size: 14px; text-align: center; line-height: 1.5;">
              💡 This is a secure one-time link. After your first login, you'll use magic links sent to your email each time you sign in.
            </p>
          </div>

          <!-- Welcome Message -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px;">Welcome ${firstName}!</h2>
            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Congratulations! You're now part of Miami's premier business community. Your membership gives you access to exclusive networking opportunities, business partnerships, and professional growth resources.
            </p>
          </div>

          <!-- Portal Features -->
          <div style="background: #f8f8f8; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-top: 0; margin-bottom: 20px;">What You Can Do in Your Portal</h3>

            <div style="margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">✏️ Complete Your Profile</h4>
              <p style="color: #666; margin: 0; line-height: 1.5; font-size: 15px;">
                Add your business details, expertise, and what you're looking for to maximize your networking potential.
              </p>
            </div>

            <div style="margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">💬 Connect & Chat</h4>
              <p style="color: #666; margin: 0; line-height: 1.5; font-size: 15px;">
                Message other members directly, build relationships, and explore partnership opportunities.
              </p>
            </div>

            <div style="margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">🤝 Smart Business Matching</h4>
              <p style="color: #666; margin: 0; line-height: 1.5; font-size: 15px;">
                Our AI-powered system finds members who are perfect matches for your business needs and goals.
              </p>
            </div>

            <div>
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">👥 Member Directory</h4>
              <p style="color: #666; margin: 0; line-height: 1.5; font-size: 15px;">
                Browse and search our complete member directory with advanced filtering options.
              </p>
            </div>
          </div>

          <!-- Next Event -->
          <div style="background: #e8f5e8; border: 1px solid #51cf66; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #2f9e44; margin-top: 0; margin-bottom: 15px;">📅 Join Our Next Event</h3>
            <p style="color: #333; margin: 0 0 15px 0; line-height: 1.5;">
              <strong>Monthly Breakfast Networking</strong><br>
              <strong>Date:</strong> Last Wednesday of every month • 9:00 AM - 10:30 AM<br>
              <strong>Location:</strong> Miami Design District<br>
              Your first networking breakfast as a member!
            </p>
            <div style="text-align: center;">
              <a href="https://luma.com/au2tl4nm" style="background: #2f9e44; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">View Upcoming Events</a>
            </div>
          </div>

          <!-- Contact Information -->
          <div style="background: #d4af37; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Questions or Need Help?</h3>
            <p style="margin: 0; font-size: 16px;">
              We're here to help you maximize your Miami Business Council experience.<br>
              Contact us at <a href="mailto:info@miamibusinesscouncil.com" style="color: white; font-weight: bold;">info@miamibusinesscouncil.com</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #888; font-size: 14px; margin: 0;">
              Miami Business Council<br>
              Creating platforms for leaders to connect, form partnerships, and collaborate<br>
              <a href="https://miamibusinesscouncil.com" style="color: #d4af37;">miamibusinesscouncil.com</a>
            </p>
          </div>
        </div>
      </div>
    `;

    // Send welcome email
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Miami Business Council <welcome@miamibusinesscouncil.com>',
        to: [email.toLowerCase()],
        subject: `🎉 Welcome ${firstName}! Access your member portal`,
        html: welcomeEmailHtml
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend API error:', errorData);
      // Don't fail the whole process if email fails - member is still created
      console.warn('Email failed but member was created successfully');
    } else {
      const emailData = await emailResponse.json();
      console.log('Welcome email sent:', emailData.id);
    }

    // Step 5: Return success
    return res.status(200).json({
      success: true,
      message: `Member created and welcome email sent to ${email}`,
      memberId: member.id,
      authUserId: authUserId
    });

  } catch (error) {
    console.error('Error processing paid member:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      details: error.toString()
    });
  }
}
