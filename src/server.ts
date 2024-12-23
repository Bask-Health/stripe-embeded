import express, { Request, Response } from "express";
import Stripe from "stripe";

const app = express();

const stripe = new Stripe('sk', {
    apiVersion: '2024-06-20', 
  });

app.use(express.static("dist"));
app.use(express.json());

// Route to create an account session
app.post('/account_session', async (req: Request, res: Response) => {
  try {
    const accountSession = await stripe.accountSessions.create({
      account: "acct", // Replace with your connected account ID
      components: {
        payments: {
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            capture_payments: true,
          },
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
