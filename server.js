import express from "express";
import bodyParser from "body-parser";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = 8000;

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(bodyParser.json());
app.use("/static", express.static(path.join(process.cwd(), "static")));

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "fakedetect.html"));
});

// Remove ```json and ```
function cleanJSON(text) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

app.post("/factcheck", async (req, res) => {
  const { text, url } = req.body;
  const content = text || url;

  if (!content) {
    return res.status(400).json({ error: "No text or URL provided" });
  }

  const systemPrompt = `
You are a fact-checking AI. Output ONLY valid JSON in this format:

{
  "classification": "REAL" or "FAKE",
  "reasoning": "text",
  "evidence": [
    { "claim": "", "sources": [] }
  ]
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Fact-check this:\n" + content },
      ],
      temperature: 0.2,
    });

    let responseText = completion.choices[0].message.content;

    // Clean ```json markup
    responseText = cleanJSON(responseText);

    let json;
    try {
      json = JSON.parse(responseText);
    } catch (err) {
      console.error("JSON parse error:", responseText);
      json = {
        classification: "UNKNOWN",
        reasoning: responseText,
        evidence: [],
      };
    }

    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to contact OpenAI API" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
