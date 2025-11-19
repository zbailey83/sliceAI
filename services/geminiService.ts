import { GoogleGenAI, Type } from "@google/genai";
import { SliceResponse } from "../types";

// Initialize Gemini Client
// Note: The API key is expected to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeAudioAndGetSlices = async (
  base64Audio: string, 
  mimeType: string
): Promise<SliceResponse> => {
  try {
    const modelId = 'gemini-2.5-flash'; // Using Flash for speed and multimodal capabilities

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          {
            text: `Analyze this audio sample. I need to slice it into rhythmic loops or distinct one-shots.
            Identify the 4 to 12 most significant transient attacks or musical phrase changes that would make good chop points.
            
            Return a JSON object with:
            1. 'slices': an array of timestamps (in seconds) where a new slice should start. Always include 0.0 as the first slice.
            2. 'bpm': an estimated tempo (number) if detectable.
            3. 'genre': a short string describing the style.
            
            Strictly follow the JSON schema.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slices: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "Start times in seconds for each slice",
            },
            bpm: {
              type: Type.NUMBER,
              description: "Estimated BPM of the audio",
            },
            genre: {
              type: Type.STRING,
              description: "Estimated genre of the audio",
            }
          },
          required: ["slices"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as SliceResponse;
    } else {
      throw new Error("No response text received from Gemini.");
    }

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback: just return a start slice if AI fails
    return { slices: [0], genre: "Unknown" };
  }
};
