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
            text: `Analyze this audio sample for a sampler application. I need you to "chop" this sample into playable slices to map onto a 4x4 pad controller (16 pads).

            Target: Identify exactly 16 slice start points (timestamps in seconds).
            
            Instructions:
            1.  Find the 16 most musically significant transient attacks (kicks, snares, sample starts) or phrase changes.
            2.  Always include 0.0 as the absolute first slice.
            3.  If the audio is short or simple, return fewer slices, but maximize the usage of the 16 pads if the content allows (e.g., slice every beat or 1/8th note).
            4.  Ensure slices are distinct (avoid slices that are extremely close together, e.g., < 0.05s).

            Return a JSON object with:
            1. 'slices': an array of numbers representing the start time in seconds for each slice.
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