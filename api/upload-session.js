// api/upload-session.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Default session details; you can override via POST body
    const {
      number = 99,
      date = "2025-10-28",
      arc = "First Home",
      title = `Session ${number}`,
      notes = `This is a test entry for Session #${number}. Arc: ${arc}.`
    } = req.body || {};

    const payload = {
      endpoint: "pages",
      method: "POST",
      body: {
        parent: { database_id: "2992fb8c325a80d9aed0d0320813a063" },
        properties: {
          Name: { title: [{ text: { content: title } }] },
          "Session Date": { date: { start: date } },
          "Session Number": { number },
          Arc: { select: { name: arc } }
        },
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ text: { content: notes } }]
            }
          }
        ]
      }
    };

    // Call your own proxy endpoint internally
    const notionProxyURL = "https://notion-proxy-six.vercel.app/api/notion-proxy";

    const notionRes = await fetch(notionProxyURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await notionRes.json();
    return res.status(notionRes.status).json(data);
  } catch (err) {
    console.error("Uploader error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
