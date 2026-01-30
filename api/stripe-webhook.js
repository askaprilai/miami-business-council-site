// Stripe webhook handler for payment events
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false, // Disable body parser to get raw body for Stripe signature verification
  },
};

// Helper to get raw body from request
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];

    let event;

    // Verify webhook signature (if webhook secret is configured)
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        console.log('✅ Webhook signature verified');
      } catch (err) {
        console.error('⚠️  Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }
    } else {
      // If no webhook secret, parse body manually (NOT recommended for production)
      console.warn('⚠️  No webhook secret configured - signature verification skipped');
      event = JSON.parse(rawBody.toString());
    }

    console.log(`📥 Webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
}

// Handle successful checkout session
async function handleCheckoutSessionCompleted(session) {
  console.log('💰 Processing checkout session completed:', session.id);

  const metadata = session.metadata;

  if (!metadata || !metadata.email) {
    console.error('No metadata found in session');
    return;
  }

  // Extract member data from metadata
  const memberData = {
    email: metadata.email,
    firstName: metadata.firstName,
    lastName: metadata.lastName,
    businessName: metadata.businessName,
    jobTitle: metadata.jobTitle,
    industry: metadata.industry,
    phone: metadata.phone,
    employeeCount: metadata.employeeCount,
    incorporated: metadata.incorporated,
    interests: metadata.interests,
    membershipType: metadata.membershipType,
    billingFrequency: metadata.billingFrequency,
    stripeCustomerId: session.customer,
    stripeSessionId: session.id
  };

  // If it's a subscription, add subscription ID
  if (session.mode === 'subscription' && session.subscription) {
    memberData.stripeSubscriptionId = session.subscription;
  }

  // Initialize Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration');
    throw new Error('Database configuration error');
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Check if member already exists (prevent duplicates)
  const { data: existingMember } = await supabaseAdmin
    .from('members')
    .select('id, email')
    .eq('email', memberData.email.toLowerCase())
    .single();

  if (existingMember) {
    console.log(`Member already exists: ${existingMember.email}`);
    // Update their payment info
    await supabaseAdmin
      .from('members')
      .update({
        stripe_customer_id: memberData.stripeCustomerId,
        stripe_subscription_id: memberData.stripeSubscriptionId,
        billing_frequency: memberData.billingFrequency,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingMember.id);
    return;
  }

  // Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: memberData.email.toLowerCase(),
    email_confirm: true,
    user_metadata: {
      first_name: memberData.firstName,
      last_name: memberData.lastName,
      membership_type: memberData.membershipType,
      onboarding_completed: false
    }
  });

  if (authError && !authError.message.includes('already registered')) {
    console.error('Auth creation error:', authError);
    throw authError;
  }

  let authUserId;
  if (authError && authError.message.includes('already registered')) {
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(memberData.email.toLowerCase());
    authUserId = existingUser?.user?.id;
  } else {
    authUserId = authData?.user?.id;
  }

  if (!authUserId) {
    throw new Error('Could not create or find auth user');
  }

  // Create member record
  const { data: member, error: memberError } = await supabaseAdmin
    .from('members')
    .upsert({
      auth_user_id: authUserId,
      email: memberData.email.toLowerCase(),
      first_name: memberData.firstName,
      last_name: memberData.lastName,
      company_name: memberData.businessName || null,
      job_title: memberData.jobTitle || null,
      industry: memberData.industry || null,
      phone: memberData.phone || null,
      employee_count: memberData.employeeCount || null,
      incorporated_status: memberData.incorporated || null,
      interests: memberData.interests || null,
      membership_type: memberData.membershipType,
      membership_tier: 'paid',
      billing_frequency: memberData.billingFrequency || 'annual',
      stripe_customer_id: memberData.stripeCustomerId,
      stripe_subscription_id: memberData.stripeSubscriptionId || null,
      subscription_status: session.mode === 'subscription' ? 'active' : null,
      is_active: true,
      profile_completed: false,
      created_at: new Date().toISOString()
    }, {
      onConflict: 'email',
      returning: 'representation'
    })
    .select()
    .single();

  if (memberError) {
    console.error('Member creation error:', memberError);
    throw memberError;
  }

  console.log(`✅ Member created: ${member.id}`);

  // Send welcome email
  await sendWelcomeEmail(memberData, resendApiKey);
}

// Handle subscription created
async function handleSubscriptionCreated(subscription) {
  console.log('📅 Subscription created:', subscription.id);

  const supabaseAdmin = getSupabaseAdmin();

  await supabaseAdmin
    .from('members')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      next_billing_date: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('stripe_customer_id', subscription.customer);
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);

  const supabaseAdmin = getSupabaseAdmin();

  await supabaseAdmin
    .from('members')
    .update({
      subscription_status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      next_billing_date: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);
}

// Handle subscription deleted (cancellation)
async function handleSubscriptionDeleted(subscription) {
  console.log('❌ Subscription deleted:', subscription.id);

  const supabaseAdmin = getSupabaseAdmin();

  await supabaseAdmin
    .from('members')
    .update({
      subscription_status: 'canceled',
      is_active: false
    })
    .eq('stripe_subscription_id', subscription.id);
}

// Handle successful invoice payment (renewals)
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('✅ Invoice payment succeeded:', invoice.id);

  if (!invoice.subscription) return;

  const supabaseAdmin = getSupabaseAdmin();

  await supabaseAdmin
    .from('members')
    .update({
      subscription_status: 'active',
      next_billing_date: new Date(invoice.period_end * 1000).toISOString()
    })
    .eq('stripe_subscription_id', invoice.subscription);
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice) {
  console.log('❌ Invoice payment failed:', invoice.id);

  if (!invoice.subscription) return;

  const supabaseAdmin = getSupabaseAdmin();

  await supabaseAdmin
    .from('members')
    .update({
      subscription_status: 'past_due'
    })
    .eq('stripe_subscription_id', invoice.subscription);
}

// Helper to get Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Helper to send welcome email
async function sendWelcomeEmail(memberData, resendApiKey) {
  if (!resendApiKey) {
    console.warn('No Resend API key - skipping welcome email');
    return;
  }

  const membershipLabel = memberData.membershipType.charAt(0).toUpperCase() + memberData.membershipType.slice(1);
  const billingLabel = memberData.billingFrequency === 'monthly' ? 'Monthly' : 'Annual';

  const welcomeEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;">
          <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 300;">🎉 Welcome to Miami Business Council!</h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your ${membershipLabel} Membership is Active (${billingLabel})</p>
        </div>

        <div style="background: #e8f5e8; border: 2px solid #51cf66; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
          <h3 style="color: #2f9e44; margin: 0 0 10px 0;">✅ Payment Confirmed</h3>
          <p style="color: #2f9e44; margin: 0; font-size: 16px;">
            <strong>${membershipLabel} Membership</strong> • ${billingLabel} Billing
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Welcome ${memberData.firstName}!</h2>
          <p style="color: #555; line-height: 1.6; font-size: 16px;">
            You're now part of Miami's premier business community. Check your email for your member portal access within 48 hours.
          </p>
        </div>

        <div style="background: #d4af37; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 10px 0;">Questions or Need Help?</h3>
          <p style="margin: 0; font-size: 16px;">
            Contact us at <a href="mailto:info@miamibusinesscouncil.com" style="color: white; font-weight: bold;">info@miamibusinesscouncil.com</a>
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Miami Business Council <welcome@miamibusinesscouncil.com>',
        to: [memberData.email.toLowerCase()],
        subject: `🎉 Welcome ${memberData.firstName}! Your membership is active`,
        html: welcomeEmailHtml
      })
    });

    if (emailResponse.ok) {
      console.log('✅ Welcome email sent');
    } else {
      console.error('❌ Welcome email failed');
    }
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
}
