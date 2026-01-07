// Fresh test for newsletter signup email (no membership content)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const newsletterSignupHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
            <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 300;">Thanks for Your Interest!</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Miami Business Council Newsletter</p>
          </div>

          <!-- Message -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px;">Hi April!</h2>
            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Thank you for signing up for our newsletter! We're excited to keep you updated on Miami's business community events and opportunities.
            </p>
            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              <strong>Important:</strong> You're currently on our newsletter list. To access exclusive member benefits, events, and networking opportunities, consider becoming a full member!
            </p>
          </div>

          <!-- Join Membership CTA -->
          <div style="background: #d4af3720; border: 2px solid #d4af37; padding: 25px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <h3 style="color: #d4af37; margin-top: 0; margin-bottom: 15px;">Ready to Become a Member?</h3>
            <p style="color: #666; margin: 0 0 20px 0; line-height: 1.5;">
              Join Miami's premier business community and unlock:
            </p>
            <ul style="color: #666; text-align: left; margin: 15px 0; line-height: 1.5;">
              <li>Monthly networking breakfast events</li>
              <li>Member directory and business matching</li>
              <li>Exclusive workshops and development opportunities</li>
              <li>Priority access to partnerships and sponsorships</li>
            </ul>
            <a href="https://miamibusinesscouncil.com/membership.html" style="background: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block; margin-top: 15px;">Become a Member Today</a>
          </div>

          <!-- Upcoming Events -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-bottom: 15px;">Upcoming Events</h3>
            <div style="background: #f8f8f8; padding: 20px; border-radius: 8px;">
              <h4 style="color: #333; margin: 0 0 10px 0;">Monthly Breakfast Networking</h4>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                <strong>Date:</strong> January 28th, 2026 • 9:00 AM - 10:30 AM<br>
                <strong>Location:</strong> Miami Design District<br>
                Open to members and prospective members.
              </p>
              <a href="https://luma.com/event-au2tl4nm" style="background: #fff; color: #d4af37; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 600; border: 2px solid #d4af37; display: inline-block; margin-top: 15px;">Learn More</a>
            </div>
          </div>

          <!-- Contact -->
          <div style="background: #333; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Questions?</h3>
            <p style="margin: 0; font-size: 16px;">
              Contact us at <a href="mailto:info@miamibusinesscouncil.com" style="color: #d4af37; font-weight: bold;">info@miamibusinesscouncil.com</a>
            </p>
          </div>

          <!-- Fresh Test Notice -->
          <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border: 1px solid #2196f3; border-radius: 5px; text-align: center;">
            <p style="margin: 0; color: #1976d2; font-weight: bold;">✅ CORRECTED: Newsletter signup email (NOT membership confirmation)</p>
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
        from: 'Miami Business Council <newsletter@miamibusinesscouncil.com>',
        to: ['april@aprilsabral.com'],
        subject: 'Thanks for joining our newsletter, April!',
        html: newsletterSignupHtml
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(500).json({ error: 'Failed to send email', details: errorData });
    }

    const data = await response.json();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Corrected newsletter signup email sent to april@aprilsabral.com',
      emailId: data.id 
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}