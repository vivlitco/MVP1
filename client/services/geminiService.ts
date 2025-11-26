import { GoogleGenAI } from "@google/genai";
// Access environment variable exposed by Vite
const API_KEY = import.meta.env.VITE_API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("API_KEY is not set. Using a mock response.");
}

export const generateCoverNote = async (prompt: string): Promise<string> => {
  if (!ai) {
    return Promise.resolve(`This is a lovely mock note about "${prompt}". In a real app, Gemini would write something beautiful here.`);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Vivlit Bunny, a friendly and gentle companion. Write a short, whimsical, and heartfelt message (2-3 sentences) for a virtual jar of notes. The theme for the jar is: "${prompt}". Make it sound magical and full of warmth.`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating cover note with Gemini:", error);
    return "A little note from a bunny: even when words get lost, feelings find their way. Your jar is filled with love.";
  }
};
