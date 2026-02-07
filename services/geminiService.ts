import { GoogleGenAI, ChatSession, GenerateContentStreamResult } from "@google/genai";
import { Message } from "../types";

export class GeminiService {
  private client: GoogleGenAI;
  private modelName = "gemini-3-flash-preview";

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async createChatStream(
    history: Message[],
    systemInstruction: string,
    newMessage: string
  ): Promise<GenerateContentStreamResult> {
    
    // Convert internal message format to API format
    // The API expects 'user' and 'model' roles.
    const apiHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const chat = this.client.chats.create({
      model: this.modelName,
      history: apiHistory,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return await chat.sendMessageStream({ message: newMessage });
  }
}
