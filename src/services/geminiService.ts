import { GoogleGenAI, Modality, Type } from "@google/genai";
import { WordOfDay } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getWordOfTheDay(date: string): Promise<WordOfDay> {
  const prompt = `Generate a "Word of the Day" for the date: ${date}. 
  The word should be interesting, useful for expanding vocabulary, and not too obscure but not too common.
  Return the word, its phonetic spelling, its meaning, an example sentence using the word, its part of speech, and a brief etymology.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          phonetic: { type: Type.STRING },
          meaning: { type: Type.STRING },
          example: { type: Type.STRING },
          partOfSpeech: { type: Type.STRING },
          etymology: { type: Type.STRING },
        },
        required: ["word", "phonetic", "meaning", "example", "partOfSpeech"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function getPronunciationAudio(word: string, phonetic: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Pronounce the word "${word}" clearly. Phonetic spelling: ${phonetic}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/wav;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating audio:", error);
    return null;
  }
}
