export interface MonetizationIdea {
  title: string;
  description: string;
  difficulty: "Low" | "Medium" | "High";
  potential: "Low" | "Medium" | "High";
  steps: string[];
  notes?: string;
}

export async function generateQuickIdeas(industry: string): Promise<MonetizationIdea[]> {
  try {
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industry }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to generate quick ideas");
    }
    const data = await res.json();
    return data.ideas || [];
  } catch (error) {
    console.error("generateQuickIdeas client-side error:", error);
    throw error;
  }
}

export async function deepDiveTrends(query: string): Promise<string> {
  try {
    const res = await fetch("/api/trends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to deep dive trends");
    }
    const data = await res.json();
    return data.result || "";
  } catch (error) {
    console.error("deepDiveTrends client-side error:", error);
    throw error;
  }
}

export async function complexAnalysis(businessModel: string): Promise<string> {
  try {
    const res = await fetch("/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessModel }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to analyze business model");
    }
    const data = await res.json();
    return data.result || "";
  } catch (error) {
    console.error("complexAnalysis client-side error:", error);
    throw error;
  }
}

export async function analyzeVideoMonetization(videoUrl: string): Promise<string> {
  try {
    const res = await fetch("/api/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoUrl }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to analyze video");
    }
    const data = await res.json();
    return data.result || "";
  } catch (error) {
    console.error("analyzeVideoMonetization client-side error:", error);
    throw error;
  }
}

export async function sendChatMessage(message: string, history: { role: "user" | "model"; text: string }[]): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to send chat message");
    }
    const data = await res.json();
    return data.result || "";
  } catch (error) {
    console.error("sendChatMessage client-side error:", error);
    throw error;
  }
}
