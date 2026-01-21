// Consolidated email handler for all member portal email types
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, ...data } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Email type is required' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    let emailConfig;

    switch (type) {
      case 'welcome':
        emailConfig = generateWelcomeEmail(data);
        break;
      case 'invitation':
        emailConfig = generateInvitationEmail(data);
        break;
      case 'password-reset':
        emailConfig = generatePasswordResetEmail(data);
        break;
      case 'contact-response':
        emailConfig = generateContactResponseEmail(data);
        break;
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailConfig)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'Failed to send email', details: errorData });
    }

    const emailData = await response.json();
    console.log(`Email sent successfully (${type}):`, emailData);

    return res.status(200).json({ 
      success: true, 
      message: `${type} email sent successfully`,
      emailId: emailData.id 
    });

  } catch (error) {
    console.error('Email handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

// Welcome email with portal credentials
function generateWelcomeEmail(data) {
  const { email, firstName, lastName, membershipType, accessCode, portalUrl, company } = data;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
          <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 300;">Welcome to Miami Business Council!</h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your Portal Access is Ready</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Welcome, ${firstName}!</h2>
          <p style="color: #555; line-height: 1.6; font-size: 16px;">
            Congratulations! Your ${membershipType} membership is now active. Access your exclusive member portal now.
          </p>
        </div>

        <div style="background: #fff3cd; border: 2px solid #d4af37; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #856404; margin-top: 0;">🚀 Your Portal Access</h3>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Access Code:</strong> <span style="font-family: monospace; color: #d4af37; font-weight: bold;">${accessCode}</span></p>
            <p style="margin: 5px 0;"><strong>Portal:</strong> <a href="${portalUrl}" style="color: #d4af37;">${portalUrl}</a></p>
          </div>
          <div style="text-align: center;">
            <a href="${portalUrl}" style="background: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Access Portal Now</a>
          </div>
        </div>

        <div style="background: #e8f5e8; border: 1px solid #51cf66; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #2f9e44; margin-top: 0;">📅 Next Event</h3>
          <p><strong>January 28th, 2025 • 9:00 AM - 10:30 AM</strong><br>Miami Design District</p>
          <div style="text-align: center; margin-top: 15px;">
            <a href="https://luma.com/au2tl4nm" style="background: #2f9e44; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">Register Now</a>
          </div>
        </div>

        <div style="background: #d4af37; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 10px 0;">Questions?</h3>
          <p style="margin: 0;">Contact us at <a href="mailto:info@miamibusinesscouncil.com" style="color: white; font-weight: bold;">info@miamibusinesscouncil.com</a></p>
        </div>
      </div>
    </div>
  `;

  return {
    from: 'Miami Business Council <welcome@miamibusinesscouncil.com>',
    to: [email],
    subject: `Welcome ${firstName}! Your MBC Portal Access is Ready`,
    html
  };
}

// Membership invitation email
function generateInvitationEmail(data) {
  const { email, name, company } = data;
  const firstName = name.split(' ')[0];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
          <h1 style="color: #d4af37; margin: 0; font-size: 28px;">You're Invited to Join Miami Business Council</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Exclusive Membership Opportunity</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333;">Hi ${firstName},</h2>
          <p style="color: #555; line-height: 1.6;">
            Thank you for your interest in Miami Business Council! We're excited to invite you to join Miami's premier business community.
          </p>
        </div>

        <div style="background: #fff3cd; border: 1px solid #d4af37; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #d4af37;">Membership Options</h3>
          <div style="text-align: center;">
            <p>Individual: $250/year | Non-Profit: $350/year | Business: $450/year</p>
            <a href="https://miamibusinesscouncil.com/membership-signup.html" style="background: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; margin-top: 15px;">Apply for Membership</a>
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    from: 'Miami Business Council <membership@miamibusinesscouncil.com>',
    to: [email],
    subject: `${firstName}, you're invited to join Miami Business Council`,
    html
  };
}

// Password reset email
function generatePasswordResetEmail(data) {
  const { email } = data;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
          <h1 style="color: #d4af37;">Portal Access Request</h1>
        </div>

        <div style="background: #e8f5e8; border: 2px solid #51cf66; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #2f9e44;">✅ Member Account Found</h3>
          <p>For security, your access code cannot be sent automatically. Please contact us for assistance:</p>
          <div style="text-align: center; margin-top: 15px;">
            <a href="mailto:info@miamibusinesscouncil.com?subject=Portal Access Code Request&body=Hi, I need help recovering my portal access code for ${email}." style="background: #2f9e44; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">Request Access Code</a>
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    from: 'Miami Business Council <support@miamibusinesscouncil.com>',
    to: [email],
    subject: 'Portal Access Code Recovery Request',
    html
  };
}

// Contact form response email
function generateContactResponseEmail(data) {
  const { email, name, message } = data;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
          <h1 style="color: #d4af37;">Thank You for Contacting Us</h1>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333;">Hi ${name},</h2>
          <p style="color: #555; line-height: 1.6;">
            Thank you for reaching out to Miami Business Council. We've received your message and will respond within 24 hours.
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #333;">Your Message:</h3>
          <p style="color: #666; font-style: italic;">"${message}"</p>
        </div>

        <div style="background: #d4af37; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0;">Questions? Reply to this email or contact us at <a href="mailto:info@miamibusinesscouncil.com" style="color: white; font-weight: bold;">info@miamibusinesscouncil.com</a></p>
        </div>
      </div>
    </div>
  `;

  return {
    from: 'Miami Business Council <noreply@miamibusinesscouncil.com>',
    to: [email],
    subject: 'Thank you for contacting Miami Business Council',
    html
  };
}