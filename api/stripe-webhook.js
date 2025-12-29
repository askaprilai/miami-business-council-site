// Stripe webhook to handle successful payments and send welcome emails
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For now, we'll handle this manually since we need Stripe webhook setup
    // This is a placeholder for future webhook integration
    
    const { email, firstName, lastName, membershipType, paymentIntent } = req.body;
    
    if (!email || !firstName || !membershipType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Send welcome email using the same template as send-welcome-email.js
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
                <a href="https://luma.com/event-au2tl4nm" style="background: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">Register for January 28th Event</a>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div style="background: #d4af37; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Questions or Need Help?</h3>
            <p style="margin: 0; font-size: 16px;">
              We're here to support your journey with Miami Business Council.<br>
              Contact us at <a href="mailto:info@miamibusinesscouncil.com" style="color: white; font-weight: bold;">info@miamibusinesscouncil.com</a>
            </p>
          </div>
        </div>
      </div>
    `;

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
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

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'Failed to send welcome email', details: errorData });
    }

    const emailData = await emailResponse.json();
    console.log('Welcome email sent via webhook:', emailData);

    return res.status(200).json({ 
      success: true, 
      message: 'Welcome email sent successfully',
      emailId: emailData.id 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}