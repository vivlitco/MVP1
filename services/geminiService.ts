import { GoogleGenAI } from "@google/genai";

// Assume process.env.API_KEY is configured in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd have a more robust way to handle this,
  // but for this demo, we'll use a placeholder if the key is missing.
  console.warn("API_KEY is not set. Using a mock response.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateCoverNote = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
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
