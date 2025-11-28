import Groq from "groq-sdk";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const app = express();
const PORT = 8000;

app.use(bodyParser.json());
app.use("/static", express.static(path.join(process.cwd(), "static")));

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "fakedetect.html"));
});

app.post("/factcheck", async (req, res) => {
  const { text, url } = req.body;
  const content = text || url;

  if (!content) {
    return res.status(400).json({ error: "No text or URL provided" });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Або інша модель
      messages: [
        {
          role: "system",
          content: "You are a fact-checking AI. Respond ONLY in JSON format.",
        },
        {
          role: "user",
          content: `Fact-check the following text:\n${content}`,
        },
      ],
    });

    const output = chatCompletion.choices[0].message.content;
    res.json(JSON.parse(output));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Groq API request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
