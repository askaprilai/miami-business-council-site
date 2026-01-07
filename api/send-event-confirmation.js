// Event registration confirmation email
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, lastName, eventName, eventDate, eventTime, eventLocation } = req.body;

    if (!email || !firstName || !eventName || !eventDate) {
      return res.status(400).json({ error: 'Missing required fields: email, firstName, eventName, eventDate' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const eventConfirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
            <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 300;">You're Registered!</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Miami Business Council Event</p>
          </div>

          <!-- Confirmation Message -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px;">Great news, ${firstName}!</h2>
            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Your registration for <strong style="color: #d4af37;">${eventName}</strong> has been confirmed. We're excited to see you there!
            </p>
          </div>

          <!-- Event Details -->
          <div style="background: #f8f8f8; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-top: 0; margin-bottom: 20px;">Event Details</h3>
            
            <div style="margin-bottom: 15px;">
              <p style="color: #333; margin: 0; font-weight: bold; font-size: 18px;">${eventName}</p>
            </div>

            <div style="margin-bottom: 15px;">
              <p style="color: #666; margin: 0; line-height: 1.5;">
                <strong>📅 Date:</strong> ${eventDate}<br>
                <strong>🕘 Time:</strong> ${eventTime || '9:00 AM - 10:30 AM'}<br>
                <strong>📍 Location:</strong> ${eventLocation || 'Miami Design District (exact address will be shared closer to the event)'}
              </p>
            </div>

            <div style="margin-bottom: 15px;">
              <p style="color: #666; margin: 0; line-height: 1.5;">
                <strong>What to expect:</strong> Professional networking, meaningful conversations, and opportunities to connect with Miami's business community.
              </p>
            </div>
          </div>

          <!-- What's Next Section -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-bottom: 15px;">What Happens Next</h3>
            <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
              <li>You'll receive a reminder email 24 hours before the event</li>
              <li>Final location details will be shared 48 hours before the event</li>
              <li>Bring business cards and be ready to connect with fellow leaders</li>
              <li>Arrive 15 minutes early for check-in and networking</li>
            </ul>
          </div>

          <!-- Not a Member CTA -->
          <div style="background: #d4af3710; border: 2px solid #d4af37; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <h4 style="color: #d4af37; margin: 0 0 10px 0;">Not a Member Yet?</h4>
            <p style="color: #666; margin: 0 0 15px 0; line-height: 1.5;">
              Join Miami Business Council to get priority access to all events, exclusive networking opportunities, and member-only benefits.
            </p>
            <a href="https://miamibusinesscouncil.com/membership-signup.html" style="background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">Become a Member</a>
          </div>

          <!-- Contact Information -->
          <div style="background: #d4af37; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Questions About the Event?</h3>
            <p style="margin: 0; font-size: 16px;">
              Need to make changes to your registration or have questions?<br>
              Contact us at <a href="mailto:events@miamibusinesscouncil.com" style="color: white; font-weight: bold;">events@miamibusinesscouncil.com</a>
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
        from: 'Miami Business Council <events@miamibusinesscouncil.com>',
        to: [email],
        subject: `You're registered for ${eventName} - Miami Business Council`,
        html: eventConfirmationHtml
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'Failed to send event confirmation email', details: errorData });
    }

    const emailData = await response.json();
    console.log('Event confirmation email sent successfully:', emailData);

    return res.status(200).json({ 
      success: true, 
      message: `Event confirmation email sent successfully to ${email}`,
      emailId: emailData.id 
    });

  } catch (error) {
    console.error('Error sending event confirmation email:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}