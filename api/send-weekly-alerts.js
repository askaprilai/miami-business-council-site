// Weekly Match Alerts Email Sender
// Sends curated match recommendations to members who have opted in
// Should be triggered every Sunday at 7pm EST via cron job

import { createSupabaseClient, TABLES } from './supabase-config.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: Validate secret token
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.WEEKLY_ALERTS_SECRET;

  if (!expectedSecret) {
    console.error('WEEKLY_ALERTS_SECRET not configured');
    return res.status(500).json({ error: 'Weekly alerts service not configured' });
  }

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    console.error('Unauthorized weekly alerts request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = createSupabaseClient(true); // Use service key for admin access
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Step 1: Get all active members with weekly alerts enabled
    const { data: alertMembers, error: membersError } = await supabase
      .from(TABLES.MEMBERS)
      .select('*')
      .eq('is_active', true)
      .eq('weekly_alerts_enabled', true);

    if (membersError) {
      console.error('Error fetching alert members:', membersError);
      return res.status(500).json({ error: 'Failed to fetch members', details: membersError.message });
    }

    if (!alertMembers || alertMembers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No members have weekly alerts enabled',
        summary: { sent: 0, failed: 0, skipped: 0, totalMembers: 0 }
      });
    }

    // Step 2: Get all active members for matching
    const { data: allMembers, error: allMembersError } = await supabase
      .from(TABLES.MEMBERS)
      .select('*')
      .eq('is_active', true);

    if (allMembersError) {
      console.error('Error fetching all members:', allMembersError);
      return res.status(500).json({ error: 'Failed to fetch members for matching' });
    }

    // Step 3: Get business opportunities data
    const { data: opportunities, error: opportunitiesError } = await supabase
      .from(TABLES.BUSINESS_OPPORTUNITIES)
      .select('*');

    if (opportunitiesError) {
      console.error('Error fetching opportunities:', opportunitiesError);
      // Continue without opportunities data if it fails
    }

    // Organize opportunities by member
    const memberOpportunities = {};
    if (opportunities) {
      opportunities.forEach(opp => {
        if (!memberOpportunities[opp.member_id]) {
          memberOpportunities[opp.member_id] = { lookingFor: [], canOffer: [] };
        }
        if (opp.opportunity_type === 'looking_for') {
          memberOpportunities[opp.member_id].lookingFor.push(opp.category);
        } else if (opp.opportunity_type === 'can_offer') {
          memberOpportunities[opp.member_id].canOffer.push(opp.category);
        }
      });
    }

    // Step 4: Process each member and send emails
    const results = [];
    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const member of alertMembers) {
      try {
        // Calculate matches for this member
        const matches = calculateMatchesForMember(
          member,
          allMembers,
          memberOpportunities
        );

        // Filter to top quality matches (score >= 60)
        const topMatches = matches
          .filter(m => m.matchScore >= 60)
          .slice(0, 5); // Top 5 matches

        // Skip if fewer than 3 good matches
        if (topMatches.length < 3) {
          console.log(`Skipping ${member.email} - only ${topMatches.length} matches`);
          skippedCount++;

          // Log to tracking table
          await logAlertSend(supabase, member.id, topMatches.length, null, 'skipped', 'Insufficient matches (< 3)');

          results.push({
            email: member.email,
            matchCount: topMatches.length,
            status: 'skipped',
            reason: 'Insufficient matches'
          });
          continue;
        }

        // Generate and send email
        const emailHtml = generateMatchAlertEmail(member, topMatches);
        const emailResult = await sendEmail(resendApiKey, {
          from: 'Miami Business Council <alerts@miamibusinesscouncil.com>',
          to: [member.email],
          subject: `🎯 ${member.first_name}, you have ${topMatches.length} new perfect matches`,
          html: emailHtml
        });

        if (emailResult.success) {
          sentCount++;

          // Log successful send
          await logAlertSend(supabase, member.id, topMatches.length, emailResult.emailId, 'sent', null);

          results.push({
            email: member.email,
            matchCount: topMatches.length,
            status: 'sent',
            emailId: emailResult.emailId
          });

          console.log(`✅ Sent alert to ${member.email} with ${topMatches.length} matches`);
        } else {
          failedCount++;

          // Log failed send
          await logAlertSend(supabase, member.id, topMatches.length, null, 'failed', emailResult.error);

          results.push({
            email: member.email,
            matchCount: topMatches.length,
            status: 'failed',
            error: emailResult.error
          });

          console.error(`❌ Failed to send alert to ${member.email}:`, emailResult.error);
        }

      } catch (memberError) {
        failedCount++;
        console.error(`Error processing member ${member.email}:`, memberError);

        results.push({
          email: member.email,
          status: 'failed',
          error: memberError.message
        });
      }
    }

    // Return summary
    return res.status(200).json({
      success: true,
      message: 'Weekly alerts processing complete',
      summary: {
        sent: sentCount,
        failed: failedCount,
        skipped: skippedCount,
        totalMembers: alertMembers.length
      },
      details: results
    });

  } catch (error) {
    console.error('Weekly alerts error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Calculate matches for a specific member
function calculateMatchesForMember(currentMember, allMembers, memberOpportunities) {
  // Get current member's opportunities
  const currentOpps = memberOpportunities[currentMember.id] || { lookingFor: [], canOffer: [] };

  const matches = allMembers
    .filter(member => member.id !== currentMember.id) // Exclude self
    .map(member => {
      const memberOpps = memberOpportunities[member.id] || { lookingFor: [], canOffer: [] };

      let score = 0;
      let matchReasons = [];
      let matchType = '';

      // Industry alignment (30 points)
      if (currentMember.industry && member.industry &&
          currentMember.industry.toLowerCase() === member.industry.toLowerCase()) {
        score += 30;
        matchReasons.push(`Both in ${member.industry}`);
        matchType = 'industry-match';
      }

      // Service/needs alignment - They need what I offer (25 points)
      const iCanHelp = currentOpps.canOffer.some(offer =>
        memberOpps.lookingFor.some(need =>
          need.toLowerCase().includes(offer.toLowerCase()) ||
          offer.toLowerCase().includes(need.toLowerCase())
        )
      );

      if (iCanHelp) {
        score += 25;
        matchReasons.push('They need what you offer');
        if (!matchType) matchType = 'service-provider';
      }

      // Service/needs alignment - I need what they offer (20 points)
      const theyCanHelp = memberOpps.canOffer.some(offer =>
        currentOpps.lookingFor.some(need =>
          need.toLowerCase().includes(offer.toLowerCase()) ||
          offer.toLowerCase().includes(need.toLowerCase())
        )
      );

      if (theyCanHelp) {
        score += 20;
        matchReasons.push('They offer what you need');
        if (matchType === 'service-provider') matchType = 'mutual';
        else if (!matchType) matchType = 'ideal-client';
      }

      // Budget/size compatibility (15 points) - Default for all MBC members
      score += 15;

      // Location bonus (10 points) - All Miami-based
      score += 10;
      if (matchReasons.length < 3) {
        matchReasons.push('Miami-based business');
      }

      // Determine match type if not set
      if (!matchType) {
        matchType = score >= 80 ? 'partnership' : 'networking';
      }

      return {
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Member',
        company: member.company_name || 'Company',
        industry: member.industry || 'Business',
        bio: member.bio || '',
        linkedin: member.linkedin_url,
        profilePhoto: member.profile_photo_url,
        matchScore: Math.min(score, 98),
        matchReasons: matchReasons.slice(0, 3),
        matchType: matchType,
        canOffer: memberOpps.canOffer,
        lookingFor: memberOpps.lookingFor
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}

// Generate HTML email for match alerts
function generateMatchAlertEmail(member, matches) {
  const firstName = member.first_name || 'Member';
  const matchCount = matches.length;

  const matchCards = matches.map(match => {
    const initials = match.firstName && match.lastName
      ? `${match.firstName[0]}${match.lastName[0]}`.toUpperCase()
      : 'MB';

    const matchTypeLabels = {
      'mutual': 'MUTUAL BENEFIT',
      'service-provider': 'THEY NEED YOU',
      'ideal-client': 'YOU NEED THEM',
      'partnership': 'PARTNERSHIP',
      'industry-match': 'INDUSTRY MATCH',
      'networking': 'NETWORKING'
    };

    const matchTypeLabel = matchTypeLabels[match.matchType] || 'CONNECTION';
    const whyMatched = match.matchReasons.join(' • ');

    return `
      <div style="background: #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 16px; border-left: 4px solid #d4af37;">
        <div style="display: flex; align-items: start; margin-bottom: 16px;">
          ${match.profilePhoto
            ? `<img src="${match.profilePhoto}" alt="${match.name}" style="width: 60px; height: 60px; border-radius: 50%; margin-right: 16px; object-fit: cover;" />`
            : `<div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #d4af37, #f4af37); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #000; margin-right: 16px; flex-shrink: 0;">${initials}</div>`
          }
          <div style="flex: 1;">
            <h3 style="color: #e8eaed; margin: 0; font-size: 18px;">${match.name}</h3>
            <p style="color: #999; margin: 4px 0; font-size: 14px;">${match.company}</p>
            <p style="color: #d4af37; margin: 0; font-size: 12px; font-weight: 600;">
              ${match.matchScore}% MATCH · ${matchTypeLabel}
            </p>
          </div>
        </div>

        ${whyMatched ? `
        <div style="background: rgba(212, 175, 55, 0.1); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
          <p style="color: #d4af37; font-weight: 600; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase;">Why You Matched</p>
          <p style="color: #e8eaed; margin: 0; font-size: 14px; line-height: 1.5;">${whyMatched}</p>
        </div>
        ` : ''}

        <a href="https://miamibusinesscouncil.com/portal#smart-matches?member=${match.id}" style="display: inline-block; background: linear-gradient(135deg, #d4af37, #f4af37); color: #000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          View Full Profile →
        </a>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Weekly Matches</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="text-align: center; padding: 30px 0;">
            <h1 style="color: #d4af37; margin: 0; font-size: 32px; font-weight: 300;">🎯 Your Weekly Matches</h1>
            <p style="color: #999; margin: 10px 0; font-size: 16px;">Curated connections for ${firstName}</p>
        </div>

        <!-- Intro -->
        <div style="background: #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="color: #e8eaed; margin: 0; line-height: 1.6; font-size: 16px;">
                We found <strong style="color: #d4af37;">${matchCount} perfect ${matchCount === 1 ? 'match' : 'matches'}</strong> for you this week based on your business goals and ideal client profile.
            </p>
        </div>

        <!-- Match Cards -->
        ${matchCards}

        <!-- Footer CTA -->
        <div style="text-align: center; padding: 30px 0;">
            <a href="https://miamibusinesscouncil.com/portal#smart-matches" style="display: inline-block; background: linear-gradient(135deg, #d4af37, #f4af37); color: #000; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 20px;">
                See All Matches in Portal
            </a>
            <p style="color: #666; font-size: 12px; margin: 20px 0 0 0;">
                <a href="https://miamibusinesscouncil.com/portal#smart-matches" style="color: #999; text-decoration: underline;">Manage alert preferences</a>
            </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #333; padding-top: 20px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 5px 0;">
                Miami Business Council<br>
                Creating platforms for leaders to connect, form partnerships, and collaborate
            </p>
            <p style="color: #666; font-size: 12px; margin: 10px 0;">
                <a href="https://miamibusinesscouncil.com" style="color: #d4af37; text-decoration: none;">miamibusinesscouncil.com</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

// Send email via Resend API
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

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Email send failed' };
    }

    const emailData = await response.json();
    return { success: true, emailId: emailData.id };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Log alert send to tracking table
async function logAlertSend(supabase, memberId, matchCount, resendEmailId, status, errorMessage) {
  try {
    await supabase
      .from('weekly_alert_sends')
      .insert({
        member_id: memberId,
        match_count: matchCount,
        resend_email_id: resendEmailId,
        status: status,
        error_message: errorMessage
      });
  } catch (error) {
    console.error('Error logging alert send:', error);
    // Don't fail the whole process if logging fails
  }
}
