/**
 * Miami Business Council - Send Member Invitation
 * Creates member record and sends magic link invitation via Supabase Auth
 *
 * This replaces the old system of generating access codes and storing in localStorage
 * Now uses Supabase Auth for secure, passwordless authentication
 *
 * Usage: POST /api/send-member-invitation
 * Body: { email, firstName, lastName, company, membershipType, personalNote }
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { supabaseConfig } from './supabase-config.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, lastName, company, membershipType, personalNote, redirectUrl } = req.body;

    // Validation
    if (!email || !firstName || !lastName || !company) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, firstName, lastName, company'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    // Create Supabase Admin client (needs service key for admin operations)
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

    console.log(`📧 Inviting new member: ${email}`);

    // Step 1: Create or get auth user first
    let authUserId;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        company_name: company,
        membership_type: membershipType || 'business'
      }
    });

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already registered')) {
        console.log(`  ℹ️  Auth user already exists: ${email}`);
        const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email.toLowerCase());
        if (!existingUser) {
          throw new Error('Could not find or create auth user');
        }
        authUserId = existingUser.user.id;
      } else {
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }
    } else {
      authUserId = authData.user.id;
      console.log(`  ✅ Auth user created: ${authUserId}`);
    }

    // Step 2: Create member record in database with auth_user_id
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from('members')
      .upsert({
        auth_user_id: authUserId,
        email: email.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        company_name: company,
        membership_type: membershipType || 'business',
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email',
        returning: 'representation'
      })
      .select()
      .single();

    if (memberError) {
      throw new Error(`Failed to create/update member: ${memberError.message}`);
    }

    console.log(`  ✅ Member record created/updated: ${memberData.id}`);

    // Step 3: Generate magic link using Supabase Auth Admin API
    const finalRedirectUrl = redirectUrl || 'https://miamibusinesscouncil.com/member-portal';

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
      options: {
        redirectTo: finalRedirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          company_name: company
        }
      }
    });

    if (linkError) {
      console.error(`  ❌ Failed to generate magic link:`, linkError);
      throw new Error(`Failed to generate magic link: ${linkError.message}`);
    }

    console.log(`  ✅ Magic link generated`);

    const magicLink = linkData.properties.action_link;

    // Step 4: Send custom welcome email with Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Miami Business Council</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0a0a0b 0%, #1a1a1b 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <img src="https://miamibusinesscouncil.com/Images/MBC%20WHITE%20LOGO%20NONTRANSPARENT%20(1).png" alt="Miami Business Council" style="height: 60px; margin-bottom: 20px;">
          <h1 style="color: #d4af37; margin: 0; font-size: 28px;">Welcome to the Council!</h1>
        </div>

        <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${firstName},</p>

          <p style="font-size: 16px; line-height: 1.8; margin-bottom: 25px;">
            Welcome to <strong>Miami Business Council</strong>! We're excited to have ${company} join our community of innovative business leaders in Miami.
          </p>

          ${personalNote ? `
            <div style="background: #f8f9fa; border-left: 4px solid #d4af37; padding: 15px 20px; margin: 25px 0; font-style: italic;">
              "${personalNote}"
            </div>
          ` : ''}

          <p style="font-size: 16px; line-height: 1.8; margin-bottom: 25px;">
            Click the button below to access your member portal. No password needed - we use secure magic links for instant access!
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4af37 100%); color: #000; padding: 16px 40px; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px;">
              Access Your Portal
            </a>
          </div>

          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #d4af37; margin-top: 0; font-size: 18px;">What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 10px;">Complete your member profile</li>
              <li style="margin-bottom: 10px;">Connect with fellow members</li>
              <li style="margin-bottom: 10px;">Join our next networking event</li>
              <li style="margin-bottom: 10px;">Explore AI-powered business matching</li>
            </ul>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            <strong>Note:</strong> This magic link will expire in 1 hour. You can always request a new one from the login page.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="font-size: 14px; color: #666; text-align: center;">
            Questions? Reply to this email or contact us at<br>
            <a href="mailto:info@miamibusinesscouncil.com" style="color: #d4af37; text-decoration: none;">info@miamibusinesscouncil.com</a>
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>Miami Business Council<br>
          Building connections that drive business growth</p>
        </div>
      </body>
      </html>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Miami Business Council <info@miamibusinesscouncil.com>',
      to: email,
      subject: `Welcome to Miami Business Council, ${firstName}! 🎉`,
      html: emailHtml
    });

    if (emailError) {
      console.error(`  ⚠️  Email send failed:`, emailError);
      // Don't fail the entire request if email fails
      // The magic link still works, they just won't get the email
    } else {
      console.log(`  ✅ Welcome email sent: ${emailData?.id}`);
    }

    // Return success
    return res.status(200).json({
      success: true,
      message: 'Member invitation sent successfully',
      email: email,
      emailId: emailData?.id,
      magicLink: magicLink // Include for admin testing
    });

  } catch (error) {
    console.error('❌ Error sending invitation:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
