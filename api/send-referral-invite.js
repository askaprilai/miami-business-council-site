// ============================================================================
// SEND REFERRAL INVITATION API
// ============================================================================
// Sends personalized invitation emails from members to their contacts
// Tracks invitations in database for conversion tracking
// ============================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get request data
        const {
            memberEmail,
            inviteeEmail,
            inviteeName,
            invitationMethod,
            personalMessage
        } = req.body;

        // Validate required fields
        if (!memberEmail || !inviteeEmail) {
            return res.status(400).json({
                error: 'Missing required fields: memberEmail and inviteeEmail are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteeEmail)) {
            return res.status(400).json({ error: 'Invalid invitee email format' });
        }

        // Get member details
        const { data: member, error: memberError } = await supabase
            .from('members')
            .select('id, first_name, last_name, email, company_name, referral_code')
            .eq('email', memberEmail)
            .eq('is_active', true)
            .single();

        if (memberError || !member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Check if invitee is already a member
        const { data: existingMember } = await supabase
            .from('members')
            .select('id, email')
            .eq('email', inviteeEmail)
            .single();

        if (existingMember) {
            return res.status(400).json({
                error: 'This person is already a member of Miami Business Council'
            });
        }

        // Check if this invitation was already sent recently (within 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentInvite } = await supabase
            .from('member_referrals')
            .select('id, invitation_sent_at')
            .eq('referrer_id', member.id)
            .eq('invitee_email', inviteeEmail)
            .gte('invitation_sent_at', thirtyDaysAgo.toISOString())
            .single();

        if (recentInvite) {
            return res.status(400).json({
                error: 'You already sent an invitation to this email address in the past 30 days'
            });
        }

        // Generate referral link
        const referralLink = `https://miamibusinesscouncil.com/join?ref=${member.referral_code}`;

        // Generate invitation email HTML
        const emailHtml = generateInvitationEmail({
            referrerFirstName: member.first_name,
            referrerLastName: member.last_name,
            referrerCompany: member.company_name,
            inviteeName: inviteeName || 'there',
            personalMessage: personalMessage || '',
            referralLink: referralLink
        });

        // Send email via Resend
        const emailResult = await sendEmail(resendApiKey, {
            from: `${member.first_name} ${member.last_name} via Miami Business Council <invites@miamibusinesscouncil.com>`,
            to: inviteeEmail,
            replyTo: member.email,
            subject: `${member.first_name} ${member.last_name} invited you to join Miami Business Council`,
            html: emailHtml
        });

        if (!emailResult.success) {
            return res.status(500).json({
                error: 'Failed to send invitation email',
                details: emailResult.error
            });
        }

        // Record invitation in database
        const { data: referral, error: referralError } = await supabase
            .from('member_referrals')
            .insert({
                referrer_id: member.id,
                referral_code: member.referral_code,
                invitee_email: inviteeEmail,
                invitee_name: inviteeName,
                invitation_method: invitationMethod || 'email',
                status: 'invited',
                resend_email_id: emailResult.emailId
            })
            .select()
            .single();

        if (referralError) {
            console.error('Failed to record referral:', referralError);
            // Don't fail the request - email was sent successfully
        }

        // Get updated member stats
        const { data: stats } = await supabase
            .from('member_points')
            .select('total_points, invites_sent, successful_referrals')
            .eq('member_id', member.id)
            .single();

        return res.status(200).json({
            success: true,
            message: 'Invitation sent successfully',
            referral: {
                id: referral?.id,
                inviteeEmail: inviteeEmail,
                inviteeName: inviteeName,
                sentAt: new Date().toISOString()
            },
            stats: stats || { total_points: 0, invites_sent: 1, successful_referrals: 0 }
        });

    } catch (error) {
        console.error('Error sending referral invitation:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}

// ============================================================================
// EMAIL TEMPLATE GENERATOR
// ============================================================================

function generateInvitationEmail({
    referrerFirstName,
    referrerLastName,
    referrerCompany,
    inviteeName,
    personalMessage,
    referralLink
}) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Join Miami Business Council</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

        <!-- Header -->
        <div style="text-align: center; padding: 40px 20px;">
            <h1 style="color: #d4af37; font-size: 2rem; margin: 0 0 10px 0;">
                Miami Business Council
            </h1>
            <p style="color: #999; margin: 0; font-size: 0.9rem;">
                Creating platforms for leaders to connect, form partnerships, and collaborate
            </p>
        </div>

        <!-- Main Content Card -->
        <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(26, 26, 26, 0.8) 100%); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; padding: 32px; margin-bottom: 24px; backdrop-filter: blur(10px);">

            <!-- Personalized Greeting -->
            <p style="color: #e8eaed; font-size: 1.1rem; margin: 0 0 24px 0; line-height: 1.6;">
                Hi ${inviteeName},
            </p>

            <!-- Invitation Message -->
            <p style="color: #e8eaed; font-size: 1rem; margin: 0 0 20px 0; line-height: 1.6;">
                <strong style="color: #d4af37;">${referrerFirstName} ${referrerLastName}</strong> ${referrerCompany ? `from <strong style="color: #d4af37;">${referrerCompany}</strong>` : ''} thinks you'd be a great fit for the <strong>Miami Business Council</strong> - an exclusive community where Miami's business leaders connect, collaborate, and grow together.
            </p>

            ${personalMessage ? `
            <!-- Personal Message from Referrer -->
            <div style="background: rgba(0, 0, 0, 0.3); border-left: 3px solid #d4af37; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="color: #d4af37; font-size: 0.85rem; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase;">
                    Personal message from ${referrerFirstName}:
                </p>
                <p style="color: #ccc; font-size: 0.95rem; margin: 0; line-height: 1.6; font-style: italic;">
                    "${personalMessage}"
                </p>
            </div>
            ` : ''}

            <!-- What You'll Get -->
            <div style="margin: 32px 0;">
                <h3 style="color: #d4af37; font-size: 1.2rem; margin: 0 0 16px 0;">
                    What You'll Get:
                </h3>
                <ul style="color: #e8eaed; margin: 0; padding-left: 24px; line-height: 2;">
                    <li><strong>Smart Matches</strong> - AI-powered introductions to ideal clients, partners, and service providers</li>
                    <li><strong>Weekly Curated Connections</strong> - Get 3-5 perfect matches delivered to your inbox every Sunday</li>
                    <li><strong>Private Member Directory</strong> - Access to Miami's top business leaders</li>
                    <li><strong>Exclusive Events</strong> - Networking opportunities designed for meaningful connections</li>
                    <li><strong>Partnership Opportunities</strong> - Find collaborators who need what you offer</li>
                </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0 16px 0;">
                <a href="${referralLink}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4af37 100%); color: #000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 1.1rem; box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);">
                    Accept Invitation →
                </a>
            </div>

            <!-- Social Proof -->
            <p style="color: #999; font-size: 0.85rem; text-align: center; margin: 20px 0 0 0;">
                Join 50+ Miami business leaders who are already making valuable connections
            </p>
        </div>

        <!-- Why Join Section -->
        <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h3 style="color: #d4af37; font-size: 1rem; margin: 0 0 16px 0; text-align: center;">
                💡 Why Miami Business Council is Different
            </h3>
            <p style="color: #ccc; font-size: 0.9rem; line-height: 1.6; margin: 0;">
                Unlike random networking events, our platform uses intelligent matching to connect you with people who actually need what you offer - and offer what you need. No more hoping to meet the right person. Get targeted introductions to your ideal clients and partners.
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 32px;">
            <p style="color: #666; font-size: 0.85rem; margin: 0 0 12px 0;">
                You received this invitation from ${referrerFirstName} ${referrerLastName}
            </p>
            <p style="color: #666; font-size: 0.85rem; margin: 0;">
                Questions? Reply to this email to connect with ${referrerFirstName} directly
            </p>
            <div style="margin-top: 20px;">
                <a href="https://miamibusinesscouncil.com" style="color: #d4af37; text-decoration: none; font-size: 0.85rem;">
                    Learn More About MBC
                </a>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
}

// ============================================================================
// SEND EMAIL VIA RESEND
// ============================================================================

async function sendEmail(apiKey, emailConfig) {
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailConfig)
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Failed to send email'
            };
        }

        return {
            success: true,
            emailId: data.id
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
