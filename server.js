require("dotenv").config();
// loads .env into process.env - must run BEFIRE creating the client

const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic();
// finds ANTHROPIC_API_KEU in proccess.env automaticlly

const express = require("express");   
// import the Express library

const app = express();                
// create your server

app.use(express.json());   
// lets the server read JSON bodies → puts them on req.body

const cors = require("cors");
app.use(cors());   
// tell the browser: cross-origin requests are allowed

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15-minute window
  max: 20,                     // max 20 requests per IP per window
  message: { error: "Too many requests — please wait a bit and try again." }
});

app.get("/", (req, res) => {          
    // when a GET request hits "/", run this
  res.send("My server is alive!");    
  // send text back
});

app.post("/explain", limiter, async (req, res) => {
    const { code, language } = req.body;

    // The code the client sent us
    if (!code) {
      return res.status(400).json({ error: "No code provided."});
    }
    if (code.length > 8000){
      return res.status(400).json({ error: "Paste up to ~8000 characters of code."});
    }
    try {
      const languageNote = language && language !== "auto"
      ? `The user says this code is written in ${language}. Explain it with that language's idioms in mind.`
      : "";
      
      const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      system:
    "You are a patient coding tutor for a self-taught beginner who knows HTML, CSS, and Java " +
    "but is new to JavaScript and backend development. When it helps, briefly relate a JS concept " +
    "to its Java equivalent.\n\n" +
    "ALWAYS respond in this exact structure, using these exact markdown headings every time:\n" +
    "## One-line summary\n" +
    "## Section-by-section walkthrough\n" +
    "## Key concepts to look up\n" +
    "## What to learn next\n\n" +
    "Formatting rules:\n" +
    "- Every piece of code you reference MUST be inside a fenced ```javascript code block. Never show code as plain text.\n" +
    "- Keep the section order and heading style identical across every response.\n\n" +
    "Accuracy rules (this is a teaching tool — a confident wrong explanation is worse than no explanation):\n" +
    "- Be precise about mechanisms. Distinguish `undefined` from `null`. Do not say something is async " +
    "because it 'takes a moment' — explain the real reason (e.g. the response body is still streaming over the network).\n" +
    "- For async/await, promises, closures, and scope, go a level deeper than surface level: explain WHY, not just WHAT.\n" +
    "- If you are not certain about a mechanism, say so rather than guessing.",
      messages: [{ role: "user", content: languageNote ? `${languageNote}\n\n${code}` : code }],
      });
      const explanation = message.content.find(b => b.type === "text")?.text??"";
      res.json({ explanation });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error : "Something went wrong explaining that."})
    }
});

app.listen(process.env.PORT || 3000, () => {              // start listening on port 3000
  console.log("Server running");
});