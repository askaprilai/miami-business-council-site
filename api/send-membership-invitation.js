// Membership invitation email for capture form leads
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, company } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Missing required fields: email, name' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const firstName = name.split(' ')[0]; // Extract first name
    const companyText = company ? ` at ${company}` : '';

    const invitationEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
            <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 300;">You're Invited to Join Miami Business Council</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Exclusive Membership Opportunity</p>
          </div>

          <!-- Personal Greeting -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px;">Hi ${firstName},</h2>
            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Thank you for your interest in Miami Business Council! We're excited to personally invite you${companyText} to join Miami's premier business community.
            </p>
            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Miami Business Council is an exclusive network of growth-minded business leaders who are serious about forming strategic partnerships, exploring collaboration opportunities, and building lasting professional relationships.
            </p>
          </div>

          <!-- Why Join Section -->
          <div style="background: #f8f8f8; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-top: 0; margin-bottom: 20px;">Why Miami Business Leaders Choose MBC</h3>
            
            <div style="margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">🤝 Strategic Business Partnerships</h4>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                Connect with complementary businesses and form mutually beneficial partnerships that drive growth.
              </p>
            </div>

            <div style="margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">🎯 AI-Powered Business Matching</h4>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                Our smart matching system connects you with members who align with your business goals and needs.
              </p>
            </div>

            <div style="margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">📅 Exclusive Monthly Events</h4>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                Intimate breakfast networking sessions in premium Miami Design District venues (limited to 25 members).
              </p>
            </div>

            <div style="margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">💬 Member Portal & Direct Messaging</h4>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                Access our exclusive member platform to chat directly with other members and explore opportunities.
              </p>
            </div>

            <div>
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">📱 Mobile App Access</h4>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                Stay connected on-the-go with our Progressive Web App for instant member access.
              </p>
            </div>
          </div>

          <!-- Membership Options -->
          <div style="background: #fff3cd; border: 1px solid #d4af37; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-top: 0; margin-bottom: 20px;">Membership Investment Options</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #e9ecef;">
                <h4 style="color: #333; margin: 0 0 10px 0;">Individual</h4>
                <p style="color: #d4af37; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">$250/year</p>
                <p style="color: #666; font-size: 14px; margin: 0;">Perfect for entrepreneurs and professionals</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #e9ecef;">
                <h4 style="color: #333; margin: 0 0 10px 0;">Non-Profit</h4>
                <p style="color: #d4af37; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">$350/year</p>
                <p style="color: #666; font-size: 14px; margin: 0;">For 501(c)(3) organizations</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #d4af37;">
                <h4 style="color: #333; margin: 0 0 10px 0;">Business</h4>
                <p style="color: #d4af37; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">$450/year</p>
                <p style="color: #666; font-size: 14px; margin: 0;"><strong>Most Popular</strong><br>For established companies</p>
              </div>
            </div>
          </div>

          <!-- Next Event Preview -->
          <div style="background: #e8f5e8; border: 1px solid #51cf66; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #2f9e44; margin-top: 0; margin-bottom: 15px;">🍳 Preview Our Next Event</h3>
            <p style="color: #333; margin: 0 0 15px 0; line-height: 1.5;">
              <strong>Monthly Breakfast Networking</strong><br>
              <strong>Date:</strong> January 28th, 2025 • 9:00 AM - 10:30 AM<br>
              <strong>Location:</strong> Miami Design District<br>
              <strong>Format:</strong> Intimate networking over gourmet breakfast (limited to 25 attendees)
            </p>
            <p style="color: #666; margin: 0; font-size: 14px;">
              Join us for meaningful conversations, strategic connections, and partnership opportunities in an elegant Design District setting.
            </p>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-bottom: 20px;">Ready to Join Miami's Business Elite?</h3>
            <div style="margin-bottom: 20px;">
              <a href="https://miamibusinesscouncil.com/membership-signup.html" style="background: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 18px; margin: 0 10px 10px 0;">Apply for Membership</a>
            </div>
            <div>
              <a href="https://miamibusinesscouncil.com/membership.html" style="background: transparent; color: #d4af37; padding: 12px 24px; text-decoration: none; border: 2px solid #d4af37; border-radius: 8px; font-weight: 600; display: inline-block;">Learn More About Benefits</a>
            </div>
          </div>

          <!-- Limited Time Offer (Optional) -->
          <div style="background: #fff2cc; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <h4 style="color: #856404; margin: 0 0 10px 0;">⏰ Limited-Time Founding Member Opportunity</h4>
            <p style="color: #856404; margin: 0; line-height: 1.5;">
              As a founding member, you'll help shape the future of Miami's premier business community. Join now and lock in these rates for life.
            </p>
          </div>

          <!-- Contact Information -->
          <div style="background: #d4af37; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Questions About Membership?</h3>
            <p style="margin: 0; font-size: 16px;">
              We're here to help you determine if Miami Business Council is right for your business.<br>
              Contact us at <a href="mailto:info@miamibusinesscouncil.com" style="color: white; font-weight: bold;">info@miamibusinesscouncil.com</a><br>
              or call us at <a href="tel:+1-305-555-0123" style="color: white; font-weight: bold;">(305) 555-0123</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #888; font-size: 14px; margin: 0;">
              Miami Business Council<br>
              Creating platforms for leaders to connect, form partnerships, and collaborate<br>
              <a href="https://miamibusinesscouncil.com" style="color: #d4af37;">miamibusinesscouncil.com</a>
            </p>
            <p style="color: #ccc; font-size: 12px; margin: 15px 0 0 0;">
              You received this invitation because you expressed interest in Miami Business Council.<br>
              <a href="#" style="color: #ccc;">Unsubscribe</a> | <a href="#" style="color: #ccc;">Update Preferences</a>
            </p>
          </div>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Miami Business Council <membership@miamibusinesscouncil.com>',
        to: [email],
        subject: `${firstName}, you're invited to join Miami Business Council`,
        html: invitationEmailHtml
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'Failed to send invitation email', details: errorData });
    }

    const emailData = await response.json();
    console.log('Membership invitation email sent successfully:', emailData);

    return res.status(200).json({ 
      success: true, 
      message: `Membership invitation sent to ${email}`,
      emailId: emailData.id 
    });

  } catch (error) {
    console.error('Error sending membership invitation:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}