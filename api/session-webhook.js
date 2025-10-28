// api/session-webhook.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      sessionNumber,
      arc = "Unknown",
      title,
      notes,
      date = new Date().toISOString().split("T")[0]
    } = req.body || {};

    if (typeof sessionNumber !== "number") {
      return res.status(400).json({
        error: "Missing or invalid 'sessionNumber' (must be a number)"
      });
    }

    // Re-use your existing upload route
    const uploadUrl =
      "https://notion-proxy-six.vercel.app/api/upload-session";

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionNumber,
        arc,
        title,
        notes,
        date
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
