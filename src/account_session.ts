import Stripe from "stripe";
// import * as dotenv from 'dotenv';

// dotenv.config();


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export default async function handler(req: any, res: any) {
  try {
    const accountSession = await stripe.accountSessions.create({
      account: process.env.STRIPE_ACCOUNT || "", // Replace with your connected account ID
      components: {
        account_onboarding: {
          enabled: true,
        },
        payments: {
          enabled: true,
        },
        payouts: {
          enabled: true,
        },
        balances: {
          enabled: true,
          features: {
            edit_payout_schedule: false,
            instant_payouts: false,
            standard_payouts: false,
          },
        },
      },
    });

    res.json({
      client_secret: accountSession.client_secret,
    });
  } catch (error: any) {
    // `any` used here as Stripe errors don't have a strict type
    console.error(
      "An error occurred when calling the Stripe API to create an account session",
      error
    );
    res.status(500).send({ error: error.message });
  }
}
