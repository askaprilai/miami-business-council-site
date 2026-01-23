// API endpoint to send message notification emails
// Notifies members when they receive a new message in the portal

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { recipientEmail, recipientName, senderName, messagePreview } = req.body;

  // Validate required fields
  if (!recipientEmail || !recipientName || !senderName || !messagePreview) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log('📧 Sending message notification to:', recipientEmail);

    // Truncate message preview to 150 characters
    const truncatedMessage = messagePreview.length > 150
      ? messagePreview.substring(0, 150) + '...'
      : messagePreview;

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Miami Business Council <info@miamibusinesscouncil.com>',
        to: [recipientEmail],
        subject: `💬 New Message from ${senderName} - Miami Business Council`,
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
              .message-box { background: #f9f9f9; padding: 20px; border-left: 4px solid #d4af37; border-radius: 4px; margin: 20px 0; font-style: italic; color: #555; }
              .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4f1e8 100%); color: #000; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .sender-name { color: #d4af37; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💬 New Message</h1>
              </div>
              <div class="content">
                <p>Hi ${recipientName},</p>

                <p><span class="sender-name">${senderName}</span> sent you a message on the Miami Business Council member portal:</p>

                <div class="message-box">
                  "${truncatedMessage}"
                </div>

                <div style="text-align: center;">
                  <a href="https://miamibusinesscouncil.com/member-portal" class="button">
                    View Message in Portal →
                  </a>
                </div>

                <p style="margin-top: 30px; font-size: 0.9rem; color: #666;">
                  💡 <strong>Tip:</strong> Log in to your member portal to read the full message and reply directly.
                </p>

                <p style="margin-top: 20px;">Stay connected!</p>

                <p style="margin-top: 30px;">
                  Best regards,<br>
                  <strong>Miami Business Council Team</strong>
                </p>
              </div>
              <div class="footer">
                <p>Miami Business Council | Connecting Miami's Business Leaders</p>
                <p>This email was sent to ${recipientEmail} because you received a message in the portal.</p>
                <p>To manage your notification preferences, log in to your <a href="https://miamibusinesscouncil.com/member-portal" style="color: #d4af37;">member portal</a>.</p>
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

    console.log('✅ Message notification sent to:', recipientEmail);
    return res.status(200).json({ success: true, messageId: data.id });

  } catch (error) {
    console.error('Error sending message notification:', error);
    return res.status(500).json({ error: 'Failed to send notification email', details: error.message });
  }
}
