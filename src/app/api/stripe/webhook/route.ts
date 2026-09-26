import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    apiVersion: '2023-10-16' as any,
  });

  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Webhook Error: Missing signature or secret');
    return NextResponse.json({ error: 'Missing configuration' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (!adminDb) {
    console.error('Firebase Admin DB not initialized');
    return NextResponse.json({ error: 'DB not initialized' }, { status: 500 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const email = session.customer_details?.email;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const plan = session.metadata?.plan || 'starter';

        if (email) {
          // Look up user by email
          const usersRef = adminDb.collection('users');
          const snapshot = await usersRef.where('email', '==', email).limit(1).get();

          if (!snapshot.empty) {
            // User exists, update their document
            const userDoc = snapshot.docs[0];
            await userDoc.ref.update({
              plan,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: 'active', // or 'trialing' if you want to track it precisely
              updatedAt: new Date(),
            });
            console.log(`Updated existing user ${email} to plan ${plan}`);
          } else {
            // User doesn't exist yet (they haven't completed onboarding).
            // Create a stub document with their email that will be merged during signup,
            // or just save it in a 'subscriptions' collection.
            // For simplicity, we create a user document placeholder.
            await usersRef.add({
              email,
              plan,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            console.log(`Created stub user for ${email} with plan ${plan}`);
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const usersRef = adminDb.collection('users');
        const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).limit(1).get();
        
        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({
            plan: 'free',
            subscriptionStatus: 'canceled',
            updatedAt: new Date(),
          });
          console.log(`Canceled subscription for customer ${customerId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
