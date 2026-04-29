import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import Ajv from "ajv";
import { fileURLToPath } from "url";
import path from "path";

import { kshitijPrompt } from "./prompts/kshitij.js";
import { anshumanPrompt } from "./prompts/anshuman.js";
import { abhimanyuPrompt } from "./prompts/abhimanyu.js";

dotenv.config();

const MAX_HISTORY_MESSAGES = 20;

const normalizeHistory = (history) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    )
    .map((item) => ({ role: item.role, content: item.content }))
    .slice(-MAX_HISTORY_MESSAGES);
};

export const createApp = ({ client }) => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const ajv = new Ajv();

  // JSON schema we expect from the model. Keep minimal and extensible.
  const replySchema = {
    type: "object",
    properties: {
      text: { type: "string" },
      metadata: { type: ["object", "null"] },
    },
    required: ["text"],
    additionalProperties: true,
  };

  const validateReply = ajv.compile(replySchema);

  // Instruction appended to system messages to force JSON output from the model.
  const JSON_SCHEMA_INSTRUCTION = `Respond ONLY with a single JSON object matching this schema: {"text":"string","metadata": object (optional)}. The response MUST be valid JSON with double quotes. Do not include any extra explanation outside the JSON. Example: {"text":"Your answer here.","metadata":{"source":"persona"}}`;

  const personaPrompts = {
    kshitij: kshitijPrompt,
    anshuman: anshumanPrompt,
    abhimanyu: abhimanyuPrompt,
  };

  app.post("/chat", async (req, res) => {
    try {
      const { message, persona, history } = req.body || {};

      if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Message is required." });
      }

      if (typeof persona !== "string" || !personaPrompts[persona]) {
        return res
          .status(400)
          .json({ error: "Unknown persona. Use kshitij, anshuman, or abhimanyu." });
      }

      const systemPrompt = personaPrompts[persona];
      const sanitizedHistory = normalizeHistory(history);

      const response = await client.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "system", content: JSON_SCHEMA_INSTRUCTION },
          ...sanitizedHistory,
          { role: "user", content: message.trim() },
        ],
      });

      const raw = response.choices?.[0]?.message?.content;
      const replyText = typeof raw === "string" ? raw.trim() : raw;

      if (!replyText) {
        return res.status(502).json({ error: "No response from model." });
      }

      // Try to parse JSON if model returned JSON; otherwise return the raw string.
      const tryParseJson = (text) => {
        if (typeof text !== "string") return null;
        try {
          return JSON.parse(text);
        } catch (e) {
          // attempt to extract JSON object substring
          const first = text.indexOf("{");
          const last = text.lastIndexOf("}");
          if (first !== -1 && last !== -1 && last > first) {
            const sub = text.substring(first, last + 1);
            try {
              return JSON.parse(sub);
            } catch (e2) {
              return null;
            }
          }
          return null;
        }
      };

      const parsed = tryParseJson(replyText);
      if (parsed !== null) {
        // Validate parsed JSON against schema
        const valid = validateReply(parsed);
        if (!valid) {
          return res.status(502).json({
            error: "Model returned JSON that does not match expected schema.",
            details: validateReply.errors,
            raw: parsed,
          });
        }

        return res.json({ reply: parsed });
      }

      // If model didn't return JSON, return the raw text so front-end can show it.
      return res.json({ reply: replyText });
    } catch (error) {
      console.error("Chat API error:", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });

  return app;
};

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  const client = new OpenAI({
    apiKey: process.env.HF_API_KEY,
    baseURL: "https://router.huggingface.co/v1",
  });
  const app = createApp({ client });
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
