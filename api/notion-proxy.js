// api/notion-proxy.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { endpoint, method = "POST", body } = req.body || {};

    if (!endpoint) {
      return res.status(400).json({ error: "Missing 'endpoint' in body" });
    }

    const notionRes = await fetch(`https://api.notion.com/v1/${endpoint}`, {
      method,
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await notionRes.json();
    return res.status(notionRes.status).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
