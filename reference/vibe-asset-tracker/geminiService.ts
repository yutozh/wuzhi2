
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateMotivation = async (itemName: string, category: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a short, inspirational "motivation" or "vision" statement for buying a ${itemName} in the category ${category}. Keep it under 20 words and in Chinese. Use an inspirational and elegant tone.`,
    });
    return response.text || "为了更好的生活品质。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "追求极致的使用体验。";
  }
};

export const suggestTags = async (itemName: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `List 2-3 short tags (2-4 characters each) for the product "${itemName}". Format as a JSON array of strings in Chinese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const tags = JSON.parse(response.text || '[]');
    return tags;
  } catch (error) {
    return ["生活", "品质"];
  }
};
