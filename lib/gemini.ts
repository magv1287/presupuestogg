import { GoogleGenAI } from '@google/genai';

// Central model constant — change here to update everywhere
export const GEMINI_MODEL = 'gemini-2.5-flash';

// Singleton client instance
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Generate text content using Gemini.
 * Use this for: analysis reports, categorization, any text generation.
 */
export async function generateText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      ...(systemInstruction && { systemInstruction }),
    },
  });
  return response.text ?? '';
}

/**
 * Generate content from image + text using Gemini Vision.
 * Use this for: screenshot transaction extraction.
 */
export async function generateFromImage(
  imageBase64: string,
  mimeType: 'image/png' | 'image/jpeg',
  textPrompt: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
      { text: textPrompt },
    ],
  });
  return response.text ?? '';
}

export { ai };
