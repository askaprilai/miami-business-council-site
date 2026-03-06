// Send newsletter with open/click tracking
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject, content, testEmail } = req.body;

  if (!subject || !content) {
    return res.status(400).json({ error: 'Subject and content required' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  if (!resendApiKey) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Create campaign record
    const campaignId = crypto.randomUUID();

    // Get subscribers (or just test email)
    let recipients = [];
    if (testEmail) {
      recipients = [{ email: testEmail, id: 'test' }];
    } else {
      const { data: subscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('id, email')
        .eq('status', 'active');

      if (error) throw error;
      recipients = subscribers || [];
    }

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No subscribers found' });
    }

    // Save campaign to database (skip for test)
    if (!testEmail) {
      await supabase.from('newsletter_campaigns').insert({
        id: campaignId,
        subject,
        content,
        sent_at: new Date().toISOString(),
        sent_count: recipients.length,
        open_count: 0,
        click_count: 0
      });
    }

    // Send emails
    let sentCount = 0;
    const baseUrl = 'https://miamibusinesscouncil.com';

    for (const recipient of recipients) {
      const trackingId = `${campaignId}_${recipient.id}`;

      // Add tracking pixel for opens
      const trackingPixel = `<img src="${baseUrl}/api/newsletter-track?action=open&id=${trackingId}" width="1" height="1" style="display:none;" />`;

      // Wrap links for click tracking
      const trackedContent = content.replace(
        /href="(https?:\/\/[^"]+)"/g,
        (match, url) => `href="${baseUrl}/api/newsletter-track?action=click&id=${trackingId}&url=${encodeURIComponent(url)}"`
      );

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
              <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 300;">Miami Business Council</h1>
            </div>

            <div style="color: #333; line-height: 1.8; font-size: 16px;">
              ${trackedContent}
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                Miami Business Council<br>
                <a href="${baseUrl}" style="color: #d4af37;">miamibusinesscouncil.com</a><br><br>
                <a href="${baseUrl}/api/newsletter-unsubscribe?email=${encodeURIComponent(recipient.email)}" style="color: #999; font-size: 11px;">Unsubscribe</a>
              </p>
            </div>
          </div>
          ${trackingPixel}
        </div>
      `;

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Miami Business Council <newsletter@miamibusinesscouncil.com>',
            to: [recipient.email],
            subject: subject,
            html: emailHtml
          })
        });

        if (response.ok) {
          sentCount++;
        }
      } catch (e) {
        console.error(`Failed to send to ${recipient.email}:`, e);
      }
    }

    return res.status(200).json({
      success: true,
      sentCount,
      campaignId: testEmail ? null : campaignId
    });

  } catch (error) {
    console.error('Newsletter send error:', error);
    return res.status(500).json({ error: error.message });
  }
}
