import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";

export const getAi = () => {
  const key = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey: key });
};

export async function transcribeAudio(base64Audio: string): Promise<string> {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Audio,
              mimeType: "audio/webm",
            },
          },
          {
            text: "Transcribe this dream recording accurately. If there are emotional cues or pauses, ignore them and focus on the spoken words.",
          },
        ],
      },
    ],
  });
  return response.text || "";
}

export async function interpretDream(transcription: string): Promise<string> {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: transcription,
    config: {
      systemInstruction: "You are a Jungian psychologist specializing in dream analysis. Provide a structured psychological interpretation of the dream, identifying key archetypes (e.g., The Shadow, The Anima/Animus, The Persona) and symbols. Use markdown for formatting.",
    },
  });
  return response.text || "";
}

export async function generateDreamImage(prompt: string, size: "1K" | "2K" | "4K" = "1K"): Promise<string> {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: {
      parts: [
        {
          text: `A surrealist, dreamy, high-quality digital art representation of the following dream theme: ${prompt}. Style: Salvador Dalí meets modern digital surrealism. Ethereal, symbolic, and emotionally resonant.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export function createDreamChat() {
  const ai = getAi();
  return ai.chats.create({
    model: "gemini-3.1-flash-lite-preview",
    config: {
      systemInstruction: "You are a dream symbol expert. Answer questions about specific symbols in the user's dream based on psychological and mythological contexts. Keep responses concise but insightful.",
    },
  });
}
