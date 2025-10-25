import "dotenv/config";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const FIREWORKS_KEY = process.env.FIREWORKS_API_KEY; // <- put key in .env

// ✅ Log that server started fine
console.log("✅ Endpoint /generate is ready");

// health-check
app.get("/", (_, res) => res.sendFile("index.html", { root: "public" }));

// main route
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  console.log("📩 Prompt received:", prompt);
  console.log("🔑 Fireworks key loaded:", FIREWORKS_KEY ? "Yes" : "No");

  try {
    if (!prompt) return res.status(400).send("Missing prompt");

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
      return res.status(500).send(errTxt);
    }

    const data = await fw.json();
    console.log("✅ Fireworks success!");
    res.json({ code: data.choices?.[0]?.text || "// No code returned" });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));

