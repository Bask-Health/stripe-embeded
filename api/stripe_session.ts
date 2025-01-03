import Stripe from "stripe";
import jwt, { JwtPayload } from "jsonwebtoken";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export default async function handler(req: any, res: any) {
  try {
    // Read the token from cookies
    const cookies: string = req.headers.cookie || "";
    const cookieObj = Object.fromEntries(
      cookies.split("; ").map((cookie: string) => {
        const [key, value] = cookie.split("=");
        return [key, decodeURIComponent(value)];
      })
    );

    const token = cookieObj.auth_token;
    if (!token) {
      return res.status(400).send({ error: "Auth token is required in cookies" });
    }

    // Validate and decode the token
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      return res.status(500).send({ error: "Server configuration error" });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch (err) {
      return res.status(401).send({ error: "Invalid or expired token" });
    }

    // Get the stripe_account from the decoded token
    const stripeAccount = decoded.stripe_account;
    if (!stripeAccount) {
      return res
        .status(400)
        .send({ error: "Token must contain stripe_account field" });
    }

    // Create the Stripe account session
    const accountSession = await stripe.accountSessions.create({
      account: stripeAccount,
      components: {
        payments: { enabled: true },
        payouts: { enabled: true },
      },
    });

    res.json({ client_secret: accountSession.client_secret });
  } catch (error: any) {
    console.error("Error in /api/stripe_session:", error.message);
    res.status(500).send({ error: error.message });
  }
}
