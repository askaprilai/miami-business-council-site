// Welcome email for new paying members (triggered after Stripe payment)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, lastName, membershipType } = req.body;

    if (!email || !firstName || !membershipType) {
      return res.status(400).json({ error: 'Missing required fields: email, firstName, membershipType' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const membershipWelcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
            <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 300;">Welcome to Miami Business Council!</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your Membership is Now Active</p>
          </div>

          <!-- Welcome Message -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px;">Welcome, ${firstName}!</h2>
            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Congratulations! Your <strong style="color: #d4af37;">${membershipType.toUpperCase()} membership</strong> with Miami Business Council is now active. You're now part of Miami's premier business community.
            </p>
            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Get ready to connect with growth-minded business leaders, access exclusive networking events, and unlock new partnership opportunities.
            </p>
          </div>

          <!-- What's Next Section -->
          <div style="background: #f8f8f8; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-top: 0; margin-bottom: 20px;">Here's What Happens Next</h3>
            
            <div style="margin-bottom: 20px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">📅 Join Our Next Event</h4>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                <strong>Next Event:</strong> January 28th, 2026 • 9:00 AM - 10:30 AM<br>
                <strong>Location:</strong> Miami Design District (exact address provided upon registration)<br>
                Your first networking breakfast as a member!
              </p>
              <div style="margin-top: 15px;">
                <a href="https://luma.com/event-au2tl4nm" style="background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">Register for January 28th Event</a>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">🏢 Access Your Member Portal</h4>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                Connect with other members, explore business opportunities, and manage your profile in our exclusive member portal.
              </p>
              <div style="margin-top: 15px;">
                <a href="https://miamibusinesscouncil.com/partnership-portal.html" style="background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">Access Member Portal</a>
              </div>
            </div>

            <div>
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">📧 Stay Connected</h4>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                You'll receive invitations to exclusive member events, networking opportunities, and business partnership alerts.
              </p>
            </div>
          </div>

          <!-- Member Benefits -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-bottom: 15px;">Your Active Member Benefits</h3>
            <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
              <li>✅ Monthly breakfast networking events in premium Design District venues</li>
              <li>✅ Access to member directory and business matching portal</li>
              <li>✅ Exclusive invitations to special events and workshops</li>
              <li>✅ Professional development opportunities and business resources</li>
              <li>✅ Priority access to partnership and sponsorship opportunities</li>
              <li>✅ Direct connections with complementary Miami business leaders</li>
            </ul>
          </div>

          <!-- Contact Information -->
          <div style="background: #d4af37; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Questions About Your Membership?</h3>
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

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Miami Business Council <welcome@miamibusinesscouncil.com>',
        to: [email],
        subject: `Thank you for your membership, ${firstName}! Welcome to Miami Business Council`,
        html: membershipWelcomeHtml
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'Failed to send membership welcome email', details: errorData });
    }

    const emailData = await response.json();
    console.log('Membership welcome email sent successfully:', emailData);

    return res.status(200).json({ 
      success: true, 
      message: `Membership welcome email sent successfully to ${email}`,
      emailId: emailData.id 
    });

  } catch (error) {
    console.error('Error sending membership welcome email:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}