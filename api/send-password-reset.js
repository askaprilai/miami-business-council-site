// Send password reset email for member portal access
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Check if this is a known member email (you could enhance this with a database lookup)
    const knownMembers = [
      'april@apriljsabral.com',
      'april@retailu.ca', 
      'sabral@me.com',
      'tommy@themadyungroup.com',
      'team@fanbusiness.com',
      'contact@ilmoda.com'
    ];

    const isKnownMember = knownMembers.includes(email.toLowerCase());

    const resetEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
            <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 300;">Portal Access Request</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Miami Business Council Member Portal</p>
          </div>

          <!-- Request Details -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px;">Access Code Request</h2>
            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              A request was made to recover the portal access code for: <strong>${email}</strong>
            </p>
          </div>

          ${isKnownMember ? `
          <!-- For Known Members -->
          <div style="background: #e8f5e8; border: 2px solid #51cf66; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #2f9e44; margin-top: 0; margin-bottom: 15px;">✅ Member Account Found</h3>
            <p style="color: #333; margin: 0 0 15px 0; line-height: 1.5;">
              You are a verified Miami Business Council member. For security reasons, your access code cannot be sent via automated email.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #51cf66; margin-bottom: 20px;">
              <h4 style="color: #333; margin: 0 0 10px 0;">🔐 To Recover Your Access Code:</h4>
              <p style="margin: 0 0 10px 0; color: #333;">1. Reply to this email with your request</p>
              <p style="margin: 0 0 10px 0; color: #333;">2. Our team will verify your identity and respond within 24 hours</p>
              <p style="margin: 0; color: #333;">3. Include your full name and company for faster verification</p>
            </div>
            <div style="text-align: center;">
              <a href="mailto:info@miamibusinesscouncil.com?subject=Portal Access Code Request&body=Hi, I need help recovering my portal access code for ${email}. My name is [YOUR NAME] and my company is [YOUR COMPANY]. Thank you!" style="background: #2f9e44; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">Request Access Code</a>
            </div>
          </div>
          ` : `
          <!-- For Unknown Emails -->
          <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #856404; margin-top: 0; margin-bottom: 15px;">📋 Email Not Found in Member Database</h3>
            <p style="color: #856404; margin: 0 0 15px 0; line-height: 1.5;">
              We couldn't find an active member account associated with <strong>${email}</strong>.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
              <h4 style="color: #856404; margin: 0 0 10px 0;">🤝 Become a Member:</h4>
              <p style="margin: 0 0 10px 0; color: #856404;">If you'd like to join Miami Business Council:</p>
              <ul style="margin: 0; color: #856404; padding-left: 20px;">
                <li>Individual Membership: $250/year</li>
                <li>Business Membership: $450/year</li>
                <li>Non-Profit Membership: $350/year</li>
              </ul>
            </div>
            <div style="text-align: center;">
              <a href="https://miamibusinesscouncil.com/membership-signup.html" style="background: #856404; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">Apply for Membership</a>
            </div>
          </div>
          `}

          <!-- Security Notice -->
          <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">🔒 Security & Privacy</h3>
            <p style="color: #666; margin: 0; line-height: 1.5; font-size: 14px;">
              This email was sent because a password reset was requested for ${email} on our member portal. 
              If you did not request this, please ignore this email. Your account remains secure.
            </p>
          </div>

          <!-- Contact Information -->
          <div style="background: #d4af37; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Need Additional Help?</h3>
            <p style="margin: 0; font-size: 16px;">
              Contact our support team for assistance with portal access.<br>
              <a href="mailto:info@miamibusinesscouncil.com" style="color: white; font-weight: bold;">info@miamibusinesscouncil.com</a>
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
        from: 'Miami Business Council <support@miamibusinesscouncil.com>',
        to: [email],
        subject: isKnownMember ? 'Portal Access Code Recovery Request' : 'Portal Access Request - Not Found',
        html: resetEmailHtml
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'Failed to send reset email', details: errorData });
    }

    const emailData = await response.json();
    console.log('Password reset email sent:', emailData);

    return res.status(200).json({ 
      success: true, 
      message: `Password reset instructions sent to ${email}`,
      emailId: emailData.id,
      memberFound: isKnownMember
    });

  } catch (error) {
    console.error('Error sending password reset email:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}