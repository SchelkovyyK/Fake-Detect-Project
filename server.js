import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Fix ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static CSS/JS/images
app.use("/static", express.static(path.join(__dirname, "static")));

// Serve your HTML homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "fakedetect.html"));
});

// ===============================
// GROQ FACT-CHECKING LOGIC
// ===============================

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function factCheck(articleText) {
  const systemPrompt = `
You are an expert fact-checker. You should:
1. Extract the key factual claims from the following news article.
2. For each claim, perform a web search to find supporting or refuting evidence.
3. Based on evidence, decide whether the article seems REAL or FAKE.
4. Return JSON in this format:
{
  "classification": "REAL" or "FAKE",
  "reasoning": "<text explanation>",
  "evidence": [
    { "claim": "<claim text>", "urls": ["<url1>", "<url2>"] }
  ]
}
`;

  const userPrompt = `Article:\n${articleText}\n\nProceed with fact-checking.`;

  const response = await client.chat.completions.create({
    model: "groq/compound",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    compound_custom: {
      tools: {
        enabled_tools: ["web_search", "visit_website"],
      },
    },
    temperature: 0.2,
  });

  const msg = response.choices[0].message.content;

  try {
    return JSON.parse(msg);
  } catch {
    return {
      classification: null,
      reasoning: msg,
      evidence: [],
    };
  }
}

// ===============================
// API endpoint used by HTML page
// ===============================

app.post("/factcheck", async (req, res) => {
  try {
    const { text, url } = req.body;

    if (!text && !url) {
      return res.json({ error: "No input provided" });
    }

    const article = text
      ? text
      : `Please fact-check the content from this URL: ${url}`;

    const result = await factCheck(article);
    res.json(result);

  } catch (err) {
    console.error(err);
    res.json({ error: "Server error" });
  }
});

// Start server
app.listen(8000, () => {
  console.log("Server running on http://127.0.0.1:8000");
});
