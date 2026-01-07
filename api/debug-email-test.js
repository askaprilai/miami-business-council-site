// DEBUG: Newsletter signup email with correct Stripe link
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; font-family: Arial;">
        <div style="background: white; padding: 30px; border-radius: 10px;">
          
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
            <h1 style="color: #d4af37; margin: 0;">Thanks for Newsletter Signup!</h1>
            <p style="color: #666; margin: 10px 0 0 0;">You're not a member yet</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #333;">Hi April!</h2>
            <p style="color: #555; line-height: 1.6;">
              Thanks for signing up for our newsletter! You're currently on our update list.
            </p>
            <p style="color: #555; line-height: 1.6;">
              Ready to become a full member and unlock exclusive benefits?
            </p>
          </div>

          <div style="background: #fff2e6; border: 2px solid #d4af37; padding: 25px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <h3 style="color: #d4af37; margin-top: 0;">Join Miami Business Council</h3>
            <p style="color: #333; margin-bottom: 20px;">
              Access exclusive networking, events, and partnerships
            </p>
            <a href="https://miamibusinesscouncil.com/membership-signup.html" 
               style="background: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 15px;">
               BECOME A MEMBER NOW
            </a>
          </div>

          <div style="background: #ff4444; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: bold;">
              ⚡ DEBUG TEST - Check this button goes to membership-signup.html
            </p>
          </div>

          <div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #1976d2; font-weight: bold;">
              ✅ FRESH DEBUG EMAIL - ${new Date().toLocaleTimeString()}
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
        from: 'Miami Business Council <debug@miamibusinesscouncil.com>',
        to: ['april@aprilsabral.com'],
        subject: 'DEBUG: Newsletter signup with correct Stripe link',
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
      message: 'DEBUG email sent with membership-signup.html link',
      emailId: data.id 
    });

  } catch (error) {
    return res.status(500).json({ error: 'Error', message: error.message });
  }
}