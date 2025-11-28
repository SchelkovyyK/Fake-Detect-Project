import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 8000;

app.use(bodyParser.json());
app.use("/static", express.static(path.join(process.cwd(), "static")));

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "fakedetect.html"));
});

// Factcheck endpoint
app.post("/factcheck", async (req, res) => {
  const { text, url } = req.body;
  const content = text || url;
  if (!content)
    return res.status(400).json({ error: "No text or URL provided" });

  const systemPrompt = `
You are an expert fact-checker. You should:
1. Extract key factual claims.
2. Perform web search for evidence.
3. Classify the article as REAL or FAKE.
4. Return JSON only in this exact structure:
{
  "classification": "REAL" or "FAKE",
  "reasoning": "explanation of why",
  "evidence": [ { "claim": "", "urls": [] } ]
}
`;

  const userPrompt = `Article:\n${content}\n\nProceed with fact-checking.`;

  try {
    const response = await fetch("https://api.groq.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "groq/compound",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        compound_custom: {
          tools: { enabled_tools: ["web_search", "visit_website"] },
        },
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    let msg = data.choices?.[0]?.message?.content || "";

    let result;
    try {
      result = JSON.parse(msg);
    } catch {
      result = { classification: null, reasoning: msg, evidence: [] };
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to contact Groq API" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
