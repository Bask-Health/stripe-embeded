import Stripe from "stripe";
import jwt, { JwtPayload } from "jsonwebtoken"; // Import the jsonwebtoken library

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export default async function handler(req: any, res: any) {
  try {
    // Get the token from the cookies
    const cookies: string = req.headers.cookie || ""; // Explicitly define cookies as a string
    const cookieObj = Object.fromEntries(
      cookies.split("; ").map((cookie: string) => {
        const [key, value] = cookie.split("=");
        return [key, decodeURIComponent(value)];
      })
    );

    const token = cookieObj.auth_token;
    if (!token) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    // Decode the JWT token using the secret
    const secret = process.env.JWT_SECRET_KEY; // Ensure this is defined in your env variables
    if (!secret) {
      throw new Error("JWT secret is not configured");
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    // Get the stripe_account from the decoded token
    const stripeAccount = decoded.stripe_account;
    if (!stripeAccount) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    // Create the Stripe account session using the decoded stripe_account
    const accountSession = await stripe.accountSessions.create({
      account: stripeAccount,
      components: {
        payments: { enabled: true },
        payouts: {
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
    console.error(
      "An error occurred when calling the Stripe API to create an account session",
      error
    );
    res.status(500).send({ error: "Internal server error" });
  }
}
