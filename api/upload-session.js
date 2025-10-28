// api/upload-session.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ✅ Accept dynamic parameters
    const {
      sessionNumber,
      date = new Date().toISOString().split("T")[0], // default: today
      arc = "Unknown",
      title,
      notes
    } = req.body || {};

    if (typeof sessionNumber !== "number") {
      return res.status(400).json({
        error: "Missing or invalid 'sessionNumber' (must be a number)"
      });
    }

    const sessionTitle = title || `Session ${sessionNumber}`;
    const sessionNotes =
      notes ||
      `Notes for Session #${sessionNumber}. Arc: ${arc}. (Auto-generated)`;

    const payload = {
      endpoint: "pages",
      method: "POST",
      body: {
        parent: { database_id: "2992fb8c325a80d9aed0d0320813a063" },
        properties: {
          Name: { title: [{ text: { content: sessionTitle } }] },
          "Session Date": { date: { start: date } },
          "Session Number": { number: sessionNumber },
          Arc: { select: { name: arc } }
        },
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ text: { content: sessionNotes } }]
            }
          }
        ]
      }
    };

    // Call your Notion proxy
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
