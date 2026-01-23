// Supabase Email Hook - Intercepts all auth emails and sends via Resend
// Configure in Supabase Dashboard: Authentication -> Email Templates -> Hooks

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Verify request is from Supabase using Standard Webhooks format
  // The secret should be: v1,whsec_bWlhbWktYnVzaW5lc3MtY291bmNpbC1zdXBhYmFzZS13ZWJob29r
  const authHeader = req.headers.authorization;
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET || 'v1,whsec_bWlhbWktYnVzaW5lc3MtY291bmNpbC1zdXBhYmFzZS13ZWJob29r';

  // Supabase sends the secret in Authorization header
  if (authHeader !== `Bearer ${webhookSecret}`) {
    console.log('Webhook auth failed. Expected:', `Bearer ${webhookSecret}`, 'Got:', authHeader);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { user, email_data } = req.body;

    // Extract email details from Supabase
    const {
      token,
      token_hash,
      redirect_to,
      email_action_type, // 'magic_link', 'recovery', 'email_change', etc.
      site_url
    } = email_data;

    const toEmail = user.email;

    // Generate confirmation URL (magic link)
    const confirmationURL = `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || site_url)}`;

    // Customize email based on action type
    let subject, htmlContent;

    switch (email_action_type) {
      case 'magic_link':
      case 'magic link':
        subject = 'Your Magic Link - Miami Business Council';
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0a0a0b 0%, #1a1a1b 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { color: #d4af37; margin: 0; }
    .content { background: #ffffff; padding: 30px; }
    .button { display: inline-block; padding: 15px 30px; background: #d4af37; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #c49d2f; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Miami Business Council</h1>
      <p>Member Portal Access</p>
    </div>
    <div class="content">
      <h2>Your Magic Link</h2>
      <p>Click the button below to securely access your Miami Business Council member portal:</p>
      <p style="text-align: center;">
        <a href="${confirmationURL}" class="button">Access Member Portal</a>
      </p>
      <p><strong>This link expires in 1 hour</strong> for your security.</p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you didn't request this email, you can safely ignore it.
        Only someone with access to your email can use this link.
      </p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Miami Business Council. All rights reserved.</p>
      <p>Domestic Non-Profit Organization</p>
    </div>
  </div>
</body>
</html>
        `;
        break;

      case 'recovery':
        subject = 'Reset Your Password - Miami Business Council';
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0a0a0b 0%, #1a1a1b 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { color: #d4af37; margin: 0; }
    .content { background: #ffffff; padding: 30px; }
    .button { display: inline-block; padding: 15px 30px; background: #d4af37; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Miami Business Council</h1>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>Click the button below to reset your password:</p>
      <p style="text-align: center;">
        <a href="${confirmationURL}" class="button">Reset Password</a>
      </p>
      <p><strong>This link expires in 1 hour.</strong></p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Miami Business Council</p>
    </div>
  </div>
</body>
</html>
        `;
        break;

      default:
        subject = `Notification from Miami Business Council`;
        htmlContent = `<h2>${email_action_type}</h2><p>Click <a href="${confirmationURL}">here</a> to continue.</p>`;
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Miami Business Council <info@miamibusinesscouncil.com>',
      to: [toEmail],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    console.log('Email sent successfully:', data);
    return res.status(200).json({ success: true, message_id: data.id });

  } catch (error) {
    console.error('Email hook error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
