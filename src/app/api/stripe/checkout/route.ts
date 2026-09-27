import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic'; // Prevent static generation during build

export async function GET(request: Request) {
  // Initialize Stripe inside the handler to avoid build-time errors if ENV is missing
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    apiVersion: '2023-10-16' as any,
  });

  const { searchParams } = new URL(request.url);
  const plan = searchParams.get('plan');
  // Check if we want monthly or yearly billing
  const billing = searchParams.get('billing') || 'yearly';

  try {
    let priceData: any = {};
    let mode: 'payment' | 'subscription' = 'subscription';

    if (plan === 'pro') {
      priceData = {
        currency: 'eur',
        product_data: {
          name: 'LinkdnForge Pro - Studio Omnicanal',
          description: billing === 'yearly' ? 'Offre Annuelle Pro (190€ / an, soit 2 mois offerts)' : 'Abonnement Pro Mensuel (29€ / mois)',
        },
        // Pro: 190€/an if yearly, 29€/mo if monthly
        unit_amount: billing === 'yearly' ? 19000 : 2900,
        recurring: {
          interval: billing === 'yearly' ? 'year' : 'month',
        },
      };
    } else {
      priceData = {
        currency: 'eur',
        product_data: {
          name: 'LinkdnForge Starter',
          description: billing === 'yearly' ? 'Abonnement Starter Annuel (140€ / an)' : 'Abonnement Starter Mensuel (19€ / mois)',
        },
        // Starter: 140€/an if yearly, 19€/mo if monthly
        unit_amount: billing === 'yearly' ? 14000 : 1900,
        recurring: {
          interval: billing === 'yearly' ? 'year' : 'month',
        },
      };
    }

      const origin =
        request.headers.get('origin') ||
        (request.headers.get('host') ? `https://${request.headers.get('host')}` : null) ||
        process.env.NEXTAUTH_URL ||
        'https://linkedinforge.fr';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: priceData,
            quantity: 1,
          },
        ],
        mode,
        subscription_data: {
          trial_period_days: 7,
        },
        metadata: {
          plan: plan || 'starter',
        },
        success_url: `${origin}/fr/setup?success=true`,
        cancel_url: `${origin}/fr/pricing?canceled=true`,
      });

    return NextResponse.redirect(session.url as string, 303);
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

