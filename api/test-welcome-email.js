// FORCE UPDATE: Newsletter signup email with CORRECT Stripe link
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const emailContent = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial;">
      <div style="background: white; padding: 30px; border-radius: 10px; border: 1px solid #ddd;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #d4af37;">Newsletter Signup Confirmed</h1>
          <p style="color: #666;">Thanks for your interest in Miami Business Council!</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2>Hi April!</h2>
          <p>You've successfully signed up for our newsletter. You'll receive updates about events and opportunities.</p>
          <p><strong>Ready to become a member?</strong> Join our community today!</p>
        </div>

        <div style="background: #f0f8ff; padding: 30px; border-radius: 10px; text-align: center;">
          <h3 style="color: #d4af37; margin-top: 0;">Become a Member Today</h3>
          
          <div style="margin: 20px 0;">
            <p><strong>Individual:</strong> $250/year</p>
            <p><strong>Non-Profit:</strong> $350/year</p>
            <p><strong>Business:</strong> $450/year</p>
          </div>
          
          <a href="https://miamibusinesscouncil.com/membership-signup.html" 
             style="background: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px; display: inline-block;">
             🔥 STRIPE MEMBERSHIP SIGNUP 🔥
          </a>
        </div>

        <div style="background: #ff6b6b; color: white; padding: 20px; margin: 20px 0; text-align: center; border-radius: 5px;">
          <strong>🔥 DEBUG TEST - JAN 7 2026</strong><br>
          Button should go to: <strong>membership-signup.html</strong><br>
          NOT membership.html (public page)<br>
          The Stripe page with $250/$350/$450 pricing
        </div>

        <div style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
          Miami Business Council | Miami, FL
        </div>

      </div>
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
        from: 'Miami Business Council <test@miamibusinesscouncil.com>',
        to: ['april@aprilsabral.com'],
        subject: 'FORCE UPDATE: Newsletter with Stripe signup link',
        html: emailContent
      })
    });

    const data = await response.json();
    
    return res.status(200).json({ 
      success: true, 
      message: 'FORCE UPDATE email sent with membership-signup.html link',
      timestamp: new Date().toISOString(),
      emailId: data.id 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}