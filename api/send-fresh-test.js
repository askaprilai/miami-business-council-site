// BRAND NEW FILE - Newsletter signup test email
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // NEWSLETTER SIGNUP EMAIL - NOT MEMBERSHIP EMAIL
    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; font-family: Arial;">
        <div style="background: white; padding: 30px; border-radius: 10px;">
          
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
            <h1 style="color: #d4af37; margin: 0;">NEWSLETTER SIGNUP CONFIRMED</h1>
            <p style="color: #666; margin: 10px 0 0 0;">You're NOT a member yet - this is just newsletter signup</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #333;">Hi April!</h2>
            <p style="color: #555; line-height: 1.6;">
              <strong>IMPORTANT:</strong> This email confirms you've signed up for our newsletter. 
              You are NOT yet a member of Miami Business Council.
            </p>
            <p style="color: #555; line-height: 1.6;">
              To become a member and access exclusive benefits, you need to sign up for a membership plan.
            </p>
          </div>

          <div style="background: #fffacd; border: 2px solid #ffa500; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <h3 style="color: #ff6600; margin-top: 0;">WANT TO BECOME A MEMBER?</h3>
            <p style="color: #333; margin-bottom: 20px;">
              Join Miami Business Council today and get access to:
            </p>
            <ul style="color: #333; text-align: left; line-height: 1.5;">
              <li>Monthly breakfast networking events</li>
              <li>Member directory access</li>
              <li>Business partnership opportunities</li>
              <li>Exclusive workshops</li>
            </ul>
            <a href="https://miamibusinesscouncil.com/membership.html" 
               style="background: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 15px;">
               SIGN UP FOR MEMBERSHIP NOW
            </a>
          </div>

          <div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #1976d2; font-weight: bold;">
              ✅ THIS IS THE CORRECT NEWSLETTER EMAIL (January 7, 2026)
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
        from: 'Miami Business Council <newsletter@miamibusinesscouncil.com>',
        to: ['april@aprilsabral.com'],
        subject: 'Newsletter signup confirmed (NOT membership) - Jan 7',
        html: emailHtml
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(500).json({ error: 'Failed to send email', details: errorData });
    }

    const data = await response.json();
    
    return res.status(200).json({ 
      success: true, 
      message: 'FRESH newsletter email sent - Jan 7 2026',
      emailId: data.id 
    });

  } catch (error) {
    return res.status(500).json({ error: 'Error', message: error.message });
  }
}