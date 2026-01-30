// Create Stripe Checkout Session for membership payments
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      businessName,
      jobTitle,
      industry,
      employeeCount,
      incorporated,
      membershipType,
      billingFrequency,
      interests
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !membershipType || !billingFrequency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get Stripe secret key
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return res.status(500).json({ error: 'Payment service not configured' });
    }

    // Import Stripe dynamically (Vercel serverless functions)
    const stripe = require('stripe')(stripeSecretKey);

    // Price IDs from Stripe Dashboard
    const priceIds = {
      individual: {
        monthly: 'price_1SvMGiQhcUWOrFc9s5cDcTtO', // $25/month
        annual: 'price_1Sh99YQhcUWOrFc9P6MnzUGy'   // $250/year
      },
      nonprofit: {
        monthly: 'price_1SvMIMQhcUWOrFc9B8KlRXN7', // $35/month
        annual: 'price_1Sh9A6QhcUWOrFc9Mdhby1S8'   // $350/year
      },
      business: {
        monthly: 'price_1SvMItQhcUWOrFc9nVU3t9ee', // $45/month
        annual: 'price_1Sh9AcQhcUWOrFc9rE01LU0O'   // $450/year
      }
    };

    const priceId = priceIds[membershipType]?.[billingFrequency];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid membership type or billing frequency' });
    }

    // Determine session mode based on billing frequency
    const mode = billingFrequency === 'monthly' ? 'subscription' : 'payment';

    // Create line item with Price ID
    const lineItems = [{
      price: priceId,
      quantity: 1
    }];

    // Get domain for URLs
    const domain = process.env.DOMAIN || 'https://miamibusinesscouncil.com';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: mode,
      line_items: lineItems,
      success_url: `${domain}/membership-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/membership-signup-monthly.html?canceled=true`,
      customer_email: email,
      metadata: {
        // Store all form data for webhook processing
        firstName,
        lastName,
        email,
        phone,
        businessName,
        jobTitle,
        industry: industry || '',
        employeeCount,
        incorporated,
        membershipType,
        billingFrequency,
        interests: interests || ''
      }
    });

    // Return the checkout session URL
    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Stripe Checkout Session creation error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
}
