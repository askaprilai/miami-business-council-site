// Notify admin when someone completes Discovery signup
export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return res.status(500).json({ error: 'Email not configured' });
  }

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="background: #d4af37; color: #000; padding: 20px; border-radius: 10px; text-align: center;">
        <h2 style="margin: 0;">🎉 New Discovery Signup!</h2>
      </div>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333;">
          Someone just completed the <strong>$100 Discovery membership</strong> signup and landed on the success page.
        </p>
        <p style="font-size: 14px; color: #666;">
          They're now seeing the <strong>March 10th Roundtable</strong> invite.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; margin: 0;">
          ${timestamp} EST
        </p>
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
        from: 'Miami Business Council <notifications@miamibusinesscouncil.com>',
        to: ['sabral@me.com'],
        subject: '🎉 New Discovery Membership Signup!',
        html: emailHtml
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send notification' });
    }
  } catch (error) {
    console.error('Notification error:', error);
    return res.status(500).json({ error: error.message });
  }
}
