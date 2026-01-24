# Supabase Magic Link Email Template

## Instructions

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vsnvtujkkkbjpuuwxvyd
2. Navigate to **Authentication** → **Email Templates**
3. Select **Magic Link** template
4. Replace the existing template with the HTML below
5. Click **Save**

---

## Email Template Settings

**Subject Line:** `Confirmation Link - Access Your Miami Business Council Portal`

**Email Template (HTML):**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Miami Business Council - Portal Access</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

        <!-- MBC Logo -->
        <div style="text-align: center; padding: 30px 0;">
            <img src="https://miamibusinesscouncil.com/Images/MBC%20WHITE%20LOGO%20TRANSPARENT.png" alt="Miami Business Council" style="height: 60px; width: auto;">
        </div>

        <!-- Main Content Card -->
        <div style="background: linear-gradient(135deg, rgba(201, 168, 106, 0.1) 0%, rgba(26, 26, 26, 0.9) 100%); border: 1px solid rgba(201, 168, 106, 0.3); border-radius: 16px; padding: 40px; margin-bottom: 24px; backdrop-filter: blur(10px);">

            <!-- Heading -->
            <h1 style="color: #C9A86A; font-size: 1.8rem; margin: 0 0 10px 0; font-weight: 700; text-align: center;">
                Welcome to the Miami Business Council
            </h1>

            <p style="color: #999; text-align: center; margin: 0 0 30px 0; font-size: 0.95rem;">
                Your portal access confirmation link
            </p>

            <!-- Friendly Message -->
            <p style="color: #e8eaed; font-size: 1rem; line-height: 1.6; margin: 0 0 24px 0;">
                Click the button below to securely access your Miami Business Council member portal. This confirmation link will expire in 1 hour for your security.
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #C9A86A; color: #000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 1.1rem; box-shadow: 0 4px 20px rgba(201, 168, 106, 0.4);">
                    Access Your Portal →
                </a>
            </div>

            <!-- Alternative Link -->
            <p style="color: #999; font-size: 0.85rem; text-align: center; margin: 24px 0 0 0; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #C9A86A; word-break: break-all;">{{ .ConfirmationURL }}</a>
            </p>
        </div>

        <!-- Security Note -->
        <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #ccc; font-size: 0.9rem; line-height: 1.6; margin: 0;">
                <strong style="color: #C9A86A;">🔒 Security Note:</strong> This confirmation link is unique to you and will expire in 1 hour. If you didn't request this email, you can safely ignore it.
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 32px;">
            <p style="color: #666; font-size: 0.85rem; margin: 0 0 12px 0;">
                Miami Business Council<br>
                Creating platforms for leaders to connect, form partnerships, and collaborate
            </p>
            <div style="margin-top: 20px;">
                <a href="https://miamibusinesscouncil.com" style="color: #C9A86A; text-decoration: none; font-size: 0.9rem; font-weight: 600;">
                    Visit Website →
                </a>
            </div>
            <div style="margin-top: 20px;">
                <img src="https://miamibusinesscouncil.com/Images/MBC%20BLACK%20LOGO%20NONTRANSPARENT%20(1).png" alt="MBC Logo" style="height: 40px; width: auto; opacity: 0.5;">
            </div>
        </div>
    </div>
</body>
</html>
```

---

## What Changed

✅ **Removed emoji** from subject line (was: "🔑 Magic Link" → now: "Confirmation Link")
✅ **Changed terminology** from "Magic Link" to "Confirmation Link"
✅ **Added MBC logo** at top and in footer
✅ **Elevated copy** - More professional and concise
✅ **Added website link** in signature for legitimacy
✅ **Brand colors** - Using official MBC gold (#C9A86A)
✅ **Security messaging** - Clear 1-hour expiration notice
✅ **Modern design** - Glassmorphism with dark theme matching portal

---

## Testing

After saving the template:
1. Go to https://miamibusinesscouncil.com/member-login
2. Enter your email address
3. Click "Send Confirmation Link"
4. Check your inbox - you should see the new branded email

---

## Troubleshooting

**Issue: Logo images not showing**
- Make sure the image URLs are publicly accessible
- Test the URLs in a browser first

**Issue: Template not applying**
- Clear your browser cache
- Wait 1-2 minutes after saving for changes to take effect
- Try logging out and logging in again

**Issue: Variables not working ({{ .ConfirmationURL }})**
- These are Supabase template variables - don't change them
- They will automatically be replaced with actual values when emails are sent
