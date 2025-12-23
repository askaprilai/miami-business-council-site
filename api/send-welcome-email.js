// Serverless function to send welcome email to new members via Resend
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, lastName, membershipType } = req.body;

    // Validate required fields
    if (!email || !firstName || !membershipType) {
      return res.status(400).json({ error: 'Missing required fields: email, firstName, membershipType' });
    }

    // Get Resend API key from environment
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Create welcome email content
    const welcomeEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
            <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 300;">Welcome to Miami Business Council!</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Miami's Premier Business Community</p>
          </div>

          <!-- Welcome Message -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px;">Hello ${firstName}!</h2>
            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Welcome to Miami Business Council! We're thrilled to have you join our community of growth-minded business leaders. 
              Your <strong style="color: #d4af37;">${membershipType} membership</strong> has been activated and you now have access to all member benefits.
            </p>
          </div>

          <!-- What's Next Section -->
          <div style="background: #f8f8f8; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-top: 0; margin-bottom: 20px;">What Happens Next</h3>
            
            <div style="margin-bottom: 20px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">📅 Monthly Breakfast Networking</h4>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                <strong>Next Event:</strong> January 28th, 2025 • 9:00 AM - 10:30 AM<br>
                <strong>Location:</strong> Miami Design District (exact address provided upon registration)<br>
                Join fellow business leaders for meaningful networking and collaboration.
              </p>
              <div style="margin-top: 15px;">
                <a href="https://miamibusinesscouncil.com/membership-success.html" style="background: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">Register for January 28th Event</a>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">📋 Member Directory</h4>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                Our comprehensive member portal launches in early 2026. You'll receive access credentials to connect with other members and explore collaboration opportunities.
              </p>
            </div>

            <div>
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">💼 Professional Development</h4>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                Access exclusive workshops, events, and opportunities designed to accelerate your business growth in Miami's dynamic market.
              </p>
            </div>
          </div>

          <!-- Member Benefits -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-bottom: 15px;">Your Membership Benefits</h3>
            <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
              <li>Monthly breakfast networking events in premium Design District venues</li>
              <li>Access to member directory and networking portal (launching early 2026)</li>
              <li>Exclusive invitations to special events and workshops</li>
              <li>Professional development opportunities and business resources</li>
              <li>Collaboration opportunities with Miami's business leaders</li>
              <li>Priority access to partnership and sponsorship opportunities</li>
            </ul>
          </div>

          <!-- Contact Information -->
          <div style="background: #d4af37; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Questions or Need Help?</h3>
            <p style="margin: 0; font-size: 16px;">
              We're here to support your journey with Miami Business Council.<br>
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

    // Send welcome email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Miami Business Council <onboarding@resend.dev>',
        to: [email],
        subject: `Welcome to Miami Business Council, ${firstName}! Your ${membershipType} membership is active`,
        html: welcomeEmailHtml
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'Failed to send welcome email', details: errorData });
    }

    const data = await response.json();
    console.log('Welcome email sent successfully:', data);

    return res.status(200).json({ 
      success: true, 
      message: 'Welcome email sent successfully',
      emailId: data.id 
    });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}