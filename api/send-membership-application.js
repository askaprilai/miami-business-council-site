// Serverless function to send membership applications via Resend
// This works with Vercel, Netlify, or similar platforms

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, from, subject, html, applicationData } = req.body;

    // You'll need to add your RESEND_API_KEY as an environment variable
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: from || 'noreply@miamibusinesscouncil.com',
        to: [to],
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'Failed to send email', details: errorData });
    }

    const data = await response.json();
    console.log('Email sent successfully:', data);

    return res.status(200).json({ 
      success: true, 
      message: 'Application email sent successfully',
      emailId: data.id 
    });

  } catch (error) {
    console.error('Error sending membership application email:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}