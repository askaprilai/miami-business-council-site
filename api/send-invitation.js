// API endpoint to send member invitation emails
// Uses Resend to send email

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Miami Business Council <info@miamibusinesscouncil.com>',
        to: [email],
        subject: '🎉 Welcome to Miami Business Council!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #d4af37 0%, #f4f1e8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { margin: 0; color: #000; font-size: 28px; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4f1e8 100%); color: #000; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .steps { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .steps ol { margin: 10px 0; padding-left: 20px; }
              .steps li { margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to Miami Business Council!</h1>
              </div>
              <div class="content">
                <p>Hi ${firstName},</p>

                <p>Great news! You've been added to the Miami Business Council member portal.</p>

                <p>Our exclusive member portal gives you access to:</p>
                <ul>
                  <li>🤝 Connect with fellow business leaders</li>
                  <li>🎯 AI-powered smart matching</li>
                  <li>💬 Direct messaging with members</li>
                  <li>📅 Exclusive networking events</li>
                  <li>📊 Member directory</li>
                </ul>

                <div class="steps">
                  <p><strong>How to access your portal:</strong></p>
                  <ol>
                    <li>Click the button below to go to the login page</li>
                    <li>Enter your email: <strong>${email}</strong></li>
                    <li>Click "Send Magic Link to Email"</li>
                    <li>Check your inbox for the magic link</li>
                    <li>Click the link to access your portal</li>
                    <li>Complete your profile and start connecting!</li>
                  </ol>
                </div>

                <div style="text-align: center;">
                  <a href="https://miamibusinesscouncil.com/member-login" class="button">
                    Access Member Portal →
                  </a>
                </div>

                <p style="margin-top: 30px;">No password needed - we use secure magic links for a seamless login experience.</p>

                <p>Need help? Reply to this email or contact us at <a href="mailto:info@miamibusinesscouncil.com">info@miamibusinesscouncil.com</a></p>

                <p>We're excited to have you in our community!</p>

                <p style="margin-top: 30px;">
                  Best regards,<br>
                  <strong>Miami Business Council Team</strong>
                </p>
              </div>
              <div class="footer">
                <p>Miami Business Council | Connecting Miami's Business Leaders</p>
                <p>This email was sent to ${email} because you were added as a member.</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(500).json({ error: 'Failed to send email', details: data });
    }

    console.log('✅ Invitation email sent to:', email);
    return res.status(200).json({ success: true, messageId: data.id });

  } catch (error) {
    console.error('Error sending invitation email:', error);
    return res.status(500).json({ error: 'Failed to send invitation email', details: error.message });
  }
}
