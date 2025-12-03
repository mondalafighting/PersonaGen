import { GoogleGenAI } from "@google/genai";
import { MBTIType, ArtStyle, ImageSize } from "../types";

// Note: The API key is injected via the environment or selected by the user in the UI context (window.aistudio).
// When using gemini-3-pro-image-preview with user-selected keys, we must instantiate the client 
// right before the call or ensure process.env.API_KEY is populated.

export const generateCharacterImage = async (
  mbti: MBTIType,
  style: ArtStyle,
  gender: 'Male' | 'Female' | 'Non-binary' = 'Female',
  size: ImageSize = '1K'
): Promise<string> => {
  // Create a new instance to ensure we pick up the latest selected key if changed
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const prompt = `
      Create a 2x2 grid image (4 panels) featuring the same character for the ${mbti.code} personality type (${mbti.name}).
      
      Character Gender: ${gender}.
      Personality Traits: ${mbti.keywords.join(', ')}.
      Description: ${mbti.description}.
      Art Style: ${style.promptModifier}.
      
      The image must be split into 4 equal quadrants (2 rows, 2 columns). Each quadrant shows the SAME character in a different variation:
      1. Top-Left: Close-up portrait with a characteristic facial expression.
      2. Top-Right: Full-body action shot or dynamic pose.
      3. Bottom-Left: Engaging in a hobby or activity typical for a ${mbti.name}.
      4. Bottom-Right: A different emotional expression or candid moment reflecting their inner world.

      Ensure the character's appearance (hair, features, clothing style) is consistent across all 4 panels.
      High resolution, detailed, clear separation between panels.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
            aspectRatio: "1:1",
            imageSize: size
        }
      }
    });

    // Iterate through parts to find the image
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};