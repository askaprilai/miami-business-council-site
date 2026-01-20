// Process new paid members and send portal access automatically
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, lastName, membershipType, paymentAmount } = req.body;
    
    if (!email || !firstName || !membershipType) {
      return res.status(400).json({ error: 'Missing required fields: email, firstName, membershipType' });
    }

    // Generate secure access code for portal
    function generateAccessCode() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }

    const accessCode = generateAccessCode();
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Get membership pricing for display
    const membershipPricing = {
      'individual': '$250/year',
      'nonprofit': '$350/year', 
      'business': '$450/year'
    };
    
    const membershipPrice = membershipPricing[membershipType] || 'Premium';

    // Create comprehensive welcome email with portal access
    const welcomeEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
            <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 300;">🎉 Welcome to Miami Business Council!</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your ${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} Membership is Active</p>
          </div>

          <!-- Payment Confirmation -->
          <div style="background: #e8f5e8; border: 2px solid #51cf66; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <h3 style="color: #2f9e44; margin: 0 0 10px 0;">✅ Payment Confirmed</h3>
            <p style="color: #2f9e44; margin: 0; font-size: 16px;">
              <strong>${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} Membership</strong> • ${membershipPrice}
            </p>
          </div>

          <!-- Portal Access Credentials -->
          <div style="background: #fff3cd; border: 2px solid #d4af37; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #856404; margin-top: 0; margin-bottom: 20px;">🚀 Your Member Portal Access</h3>
            <p style="color: #333; margin-bottom: 15px;">Access your exclusive member dashboard right now:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #d4af37; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0; color: #333;"><strong>Portal URL:</strong> <a href="https://miamibusinesscouncil.com/member-portal.html" style="color: #d4af37;">miamibusinesscouncil.com/member-portal.html</a></p>
              <p style="margin: 0 0 10px 0; color: #333;"><strong>Email:</strong> <span style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${email}</span></p>
              <p style="margin: 0; color: #333;"><strong>Access Code:</strong> <span style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-weight: bold; color: #d4af37;">${accessCode}</span></p>
            </div>

            <div style="text-align: center; margin-bottom: 15px;">
              <a href="https://miamibusinesscouncil.com/member-portal.html" style="background: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">Access Your Portal Now</a>
            </div>

            <p style="color: #666; margin: 0; font-size: 14px; text-align: center;">💡 Save these credentials securely - you'll use them every time you log in</p>
          </div>

          <!-- Welcome Message -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px;">Welcome ${firstName}!</h2>
            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Congratulations! You're now part of Miami's premier business community. Your membership gives you access to exclusive networking opportunities, business partnerships, and professional growth resources.
            </p>
          </div>

          <!-- Portal Features -->
          <div style="background: #f8f8f8; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #d4af37; margin-top: 0; margin-bottom: 20px;">What You Can Do in Your Portal</h3>
            
            <div style="margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">💬 Connect & Chat</h4>
              <p style="color: #666; margin: 0; line-height: 1.5; font-size: 15px;">
                Message other members directly, build relationships, and explore partnership opportunities.
              </p>
            </div>

            <div style="margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">🤝 Smart Business Matching</h4>
              <p style="color: #666; margin: 0; line-height: 1.5; font-size: 15px;">
                Our AI-powered system finds members who are perfect matches for your business needs and goals.
              </p>
            </div>

            <div style="margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">👥 Member Directory</h4>
              <p style="color: #666; margin: 0; line-height: 1.5; font-size: 15px;">
                Browse and search our complete member directory with advanced filtering options.
              </p>
            </div>

            <div>
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">📱 Mobile App</h4>
              <p style="color: #666; margin: 0; line-height: 1.5; font-size: 15px;">
                Install the portal as an app on your phone for quick access anywhere.
              </p>
            </div>
          </div>

          <!-- Next Event -->
          <div style="background: #e8f5e8; border: 1px solid #51cf66; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #2f9e44; margin-top: 0; margin-bottom: 15px;">📅 Join Our Next Event</h3>
            <p style="color: #333; margin: 0 0 15px 0; line-height: 1.5;">
              <strong>Monthly Breakfast Networking</strong><br>
              <strong>Date:</strong> January 28th, 2025 • 9:00 AM - 10:30 AM<br>
              <strong>Location:</strong> Miami Design District<br>
              Your first networking breakfast as a member!
            </p>
            <div style="text-align: center;">
              <a href="https://luma.com/au2tl4nm" style="background: #2f9e44; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">Register for January 28th Event</a>
            </div>
          </div>

          <!-- Contact Information -->
          <div style="background: #d4af37; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Questions or Need Help?</h3>
            <p style="margin: 0; font-size: 16px;">
              We're here to help you maximize your Miami Business Council experience.<br>
              Contact us at <a href="mailto:info@miamibusinesscouncil.com" style="color: white; font-weight: bold;">info@miamibusinesscouncil.com</a>
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

    // Send welcome email with portal credentials
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Miami Business Council <welcome@miamibusinesscouncil.com>',
        to: [email],
        subject: `🎉 Welcome ${firstName}! Your MBC portal access is ready`,
        html: welcomeEmailHtml
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'Failed to send welcome email', details: errorData });
    }

    const emailData = await emailResponse.json();
    console.log('Paid member welcome email sent:', emailData);

    // Return the credentials so they can be stored for immediate portal access
    return res.status(200).json({ 
      success: true, 
      message: `Welcome email with portal access sent to ${email}`,
      emailId: emailData.id,
      memberCredentials: {
        email: email.toLowerCase(),
        accessCode: accessCode,
        name: `${firstName} ${lastName}`,
        membershipType: membershipType,
        paymentAmount: paymentAmount
      }
    });

  } catch (error) {
    console.error('Error processing paid member:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}