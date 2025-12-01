'use client';

import { GoogleGenAI, Type } from "@google/genai";

// Note: In Next.js, we need to use NEXT_PUBLIC_ prefix for client-side env vars
const getApiKey = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_ prefixed env var
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }
  // Server-side: use regular env var
  return process.env.GEMINI_API_KEY;
};

const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key missing. Please configure GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY environment variable.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateProductDescription = async (title: string, category: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "API Key missing. Please configure your environment.";

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a catchy, short, and persuasive product description (max 2 sentences) for a product named "${title}" in the category "${category}".`,
    });
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate description. Please try again.";
  }
};

export const generateStoreInventory = async (category: string = "General"): Promise<any[]> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key missing");

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 10 unique, interesting e-commerce products for a store specializing in "${category}". 
      Return a JSON array where each object has: title, description (short), price (number), and a visual keyword for an image search.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.NUMBER },
              imageKeyword: { type: Type.STRING }
            },
            required: ["title", "description", "price", "imageKeyword"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Batch Error:", error);
    throw error;
  }
};

export const generateEnhancedProductImage = async (productDescription: string, stylePrompt: string): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const ai = getAI();
    // We combine the product description with the user's style preference to create a full image prompt
    const fullPrompt = `A professional, high-quality product photography shot of ${productDescription}. 
    Style/Setting: ${stylePrompt}. 
    Lighting: Studio lighting, sharp focus, 4k resolution, commercial photography.`;

    // Using gemini-2.5-flash-image for image generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          numberOfImages: 1
        }
      }
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64String = part.inlineData.data;
        return `data:image/png;base64,${base64String}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};

