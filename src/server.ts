import express, { Request, Response } from "express";
import Stripe from "stripe";
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-06-20', 
  });

app.use(express.static("dist"));
app.use(express.json());

// Route to create an account session
app.post('/account_session', async (req: Request, res: Response) => {
  try {
    const accountSession = await stripe.accountSessions.create({
      account: process.env.STRIPE_ACCOUNT || '', // Replace with your connected account ID
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
        },
      },
    });

    res.json({
      client_secret: accountSession.client_secret,
    });
  } catch (error: any) { // `any` used here as Stripe errors don't have a strict type
    console.error(
      'An error occurred when calling the Stripe API to create an account session',
      error
    );
    res.status(500).send({ error: error.message });
  }
});

// Start the server
const PORT = 4242;
app.listen(PORT, () =>
  console.log(`Node server listening on port ${PORT}! Visit http://localhost:${PORT} in your browser.`)
);
