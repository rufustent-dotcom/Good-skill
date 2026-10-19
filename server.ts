import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper for model fallback
async function generateContentWithFallback(params: any) {
  try {
    return await ai.models.generateContent(params);
  } catch (error: any) {
    console.error("Gemini API Error with primary model:", error);
    const errorMessage = error?.message || "";
    const isQuotaError = errorMessage.includes("quota") || errorMessage.includes("limit") || errorMessage.includes("RESOURCE_EXHAUSTED") || error?.status === 429 || error?.status === "RESOURCE_EXHAUSTED";
    
    if (isQuotaError) {
      console.warn("Attempting fallback to gemini-3.5-flash on free tier without advanced tools...");
      const fallbackParams = { ...params, model: "gemini-3.5-flash" };
      // Remove any thinkingConfig or tools if they are causing rate limits
      if (fallbackParams.config) {
        if (fallbackParams.config.thinkingConfig) delete fallbackParams.config.thinkingConfig;
        if (fallbackParams.config.tools) delete fallbackParams.config.tools;
      }
      return await ai.models.generateContent(fallbackParams);
    }
    throw error;
  }
}

// API Routes
app.post("/api/ideas", async (req, res) => {
  const { industry } = req.body;
  if (!industry) {
    return res.status(400).json({ error: "Industry is required" });
  }

  try {
    const response = await generateContentWithFallback({
      model: "gemini-3.1-flash-lite", // Extremely lightweight and fast
      contents: `Generate 5 unique and actionable monetization ideas for the ${industry} industry. Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              potential: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["title", "description", "difficulty", "potential", "steps"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    res.json({ ideas: parsed });
  } catch (error: any) {
    console.error("Error generating quick ideas:", error);
    res.status(500).json({ error: error.message || "Failed to generate monetization ideas" });
  }
});

app.post("/api/trends", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    // standard text model is gemini-3.5-flash
    const response = await generateContentWithFallback({
      model: "gemini-3.5-flash",
      contents: `Research current monetization trends and "money making" opportunities for: ${query}. Focus on up-to-date information.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    res.json({ result: response.text || "" });
  } catch (error: any) {
    console.error("Error researching trends:", error);
    res.status(500).json({ error: error.message || "Failed to research trends" });
  }
});

app.post("/api/analysis", async (req, res) => {
  const { businessModel } = req.body;
  if (!businessModel) {
    return res.status(400).json({ error: "Business model is required" });
  }

  try {
    // Primary is gemini-3.1-pro-preview with high thinkingLevel,
    // fallback to gemini-3.5-flash if needed (for free tier limit: 0)
    const response = await generateContentWithFallback({
      model: "gemini-3.1-pro-preview",
      contents: `Provide a deep, high-level thinking analysis of the following business model/monetization strategy: ${businessModel}. 
      Analyze risks, scalability, market fit, and long-term sustainability.`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      },
    });

    res.json({ result: response.text || "" });
  } catch (error: any) {
    console.error("Error conducting complex analysis:", error);
    res.status(500).json({ error: error.message || "Failed to analyze model" });
  }
});

app.post("/api/video", async (req, res) => {
  const { videoUrl } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ error: "Video URL option is required" });
  }

  try {
    // Use gemini-3.5-flash
    const response = await generateContentWithFallback({
      model: "gemini-3.5-flash",
      contents: `Analyze the monetization potential of the content at this URL or description: ${videoUrl}. 
      Provide a general analysis of how a video with this topic typically makes money, key target audiences, and platform-specific tips.`,
    });

    res.json({ result: response.text || "" });
  } catch (error: any) {
    console.error("Error analyzing video monetization:", error);
    res.status(500).json({ error: error.message || "Failed to analyze video" });
  }
});

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Initialize standard chat using gemini-3.5-flash so we don't hit pro-specific prompt rate limits / restrictions
    const chatConfig = {
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "You are a world-class monetization strategist. Your goal is to help users find every possible way to make money from their ideas, apps, or businesses. Be creative, practical, and thorough.",
      },
      history: (history || []).map((h: any) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    };

    try {
      const chat = ai.chats.create(chatConfig);
      const response = await chat.sendMessage({ message });
      res.json({ result: response.text || "" });
    } catch (primaryError: any) {
      console.warn("Chat failed with primary model:", primaryError?.message);
      const isQuotaError = primaryError?.message?.includes("quota") || primaryError?.message?.includes("limit") || primaryError?.message?.includes("RESOURCE_EXHAUSTED") || primaryError?.status === 429;
      
      if (isQuotaError) {
        console.warn("Attempting fallback chat with gemini-3.1-flash-lite...");
        const fallbackChat = ai.chats.create({
          ...chatConfig,
          model: "gemini-3.1-flash-lite"
        });
        const fallbackResponse = await fallbackChat.sendMessage({ message });
        return res.json({ result: fallbackResponse.text || "" });
      }
      throw primaryError;
    }
  } catch (error: any) {
    console.error("Error during chat:", error);
    res.status(500).json({ error: error.message || "Chat failed" });
  }
});

// Setup Vite or static serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupVite();
