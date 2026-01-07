export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return res.status(500).json({ error: 'No API key' });
  }

  const html = `
    <div style="max-width: 500px; margin: 20px auto; padding: 20px; font-family: Arial; background: white; border-radius: 10px;">
      
      <h1 style="color: #d4af37; text-align: center;">Newsletter Signup</h1>
      <p style="text-align: center; color: #666;">Thanks for your interest!</p>
      
      <hr style="border: 1px solid #d4af37; margin: 20px 0;">
      
      <h2>Hi April!</h2>
      <p>You signed up for our newsletter. Ready to become a member?</p>
      
      <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #d4af37;">Join Miami Business Council</h3>
        <p><strong>Individual:</strong> $250/year</p>
        <p><strong>Non-Profit:</strong> $350/year</p> 
        <p><strong>Business:</strong> $450/year</p>
        
        <a href="https://miamibusinesscouncil.com/membership-signup.html" 
           style="background: #d4af37; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 15px;">
           SIGN UP NOW
        </a>
      </div>
      
      <div style="background: #e74c3c; color: white; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <strong>🚨 NEW ENDPOINT TEST - JAN 7</strong><br>
        This button should go to membership-signup.html
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
        subject: 'NEW ENDPOINT: Newsletter with correct Stripe link',
        html: html
      })
    });

    const result = await response.json();
    
    return res.json({ 
      success: true, 
      message: 'NEW ENDPOINT email sent',
      emailId: result.id,
      link: 'membership-signup.html'
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}