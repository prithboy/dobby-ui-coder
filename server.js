import "dotenv/config";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const FIREWORKS_KEY = process.env.FIREWORKS_API_KEY; console.log("🔑 Fireworks key loaded:", FIREWORKS_KEY ? "Yes" : "No");

// ✅ Root route (index.html)
app.get("/", (_, res) => {
  res.sendFile("index.html", { root: "public" });
});

// ✅ API route
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("📩 Prompt received:", prompt);

    if (!prompt) return res.status(400).json({ error: "Missing prompt" });
    if (!FIREWORKS_KEY)
      return res.status(500).json({ error: "Missing FIREWORKS_API_KEY" });

    const fw = await fetch("https://api.fireworks.ai/inference/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIREWORKS_KEY}`,
      },
      body: JSON.stringify({
        model: "accounts/sentientfoundation-serverless/models/dobby-mini-unhinged-plus-llama-3-1-8b",
        prompt,
        max_tokens: 600,
      }),
    });

    if (!fw.ok) {
      const errText = await fw.text();
      console.error("❌ Fireworks API error:", errText);
      return res.status(500).json({ error: errText });
    }

    const data = await fw.json();
    console.log("✅ Fireworks success!");
    res.json({ code: data.choices?.[0]?.text || "// No code returned" });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Important for Vercel
export default app;
