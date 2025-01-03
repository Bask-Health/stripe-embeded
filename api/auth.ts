import jwt, { JwtPayload } from "jsonwebtoken";

export default async function handler(req: any, res: any) {
  try {
    // Get the token from the query parameter
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Decode and validate the received token
    const secret = process.env.JWT_SECRET_KEY; // Ensure this is set in your .env file
    if (!secret) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    let decoded: JwtPayload; // Define the expected type for the decoded token
    try {
      decoded = jwt.verify(token, secret) as JwtPayload; // Explicitly cast to JwtPayload
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Extract data from the decoded token
    const stripe_account = decoded.stripe_account as string; // Explicitly assert the type
    if (!stripe_account) {
      return res.status(400).json({ error: "Token is missing stripe_account field" });
    }

    // Create a new token with a 1-day expiration
    const newToken = jwt.sign(
      { stripe_account },
      secret, // Use the same secret for signing the new token
      { expiresIn: "1d" }
    );

    // Set the new token as a cookie
    res.setHeader("Set-Cookie", [
      `auth_token=${newToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
    ]);

    // Redirect to the account session endpoint
    res.writeHead(302, {
      Location: `/`,
    });
    res.end();
  } catch (error: any) {
    console.error("Error in /api/auth:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
