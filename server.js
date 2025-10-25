import "dotenv/config";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const FIREWORKS_KEY = process.env.FIREWORKS_API_KEY;

// health-check
app.get("/", (_, res) => res.sendFile("index.html", { root: "public" }));

// main route
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).send("Missing prompt");

    console.log("📩 Prompt received:", prompt);
    console.log("🔑 Fireworks key loaded:", !!FIREWORKS_KEY);

    const fw = await fetch("https://api.fireworks.ai/inference/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIREWORKS_KEY}`,
      },
      body: JSON.stringify({
        model: "accounts/sentientfoundation-serverless/models/dobby-mini-unhinged-plus-llama-3-1-8b",
        prompt,
        max_tokens: 500,
      }),
    });

    if (!fw.ok) {
      const errTxt = await fw.text();
      console.error("❌ Fireworks error:", errTxt);
      return res.status(500).send("// Fireworks API error: " + errTxt);
    }

    const data = await fw.json();
    console.log("✅ Fireworks success!");
    res.json({ code: data.choices?.[0]?.text || "// No code returned" });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).send("// Server error: " + err.message);
  }
});

// 👇 instead of app.listen, we export the handler for Vercel
export default app;
