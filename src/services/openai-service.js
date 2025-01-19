import { OpenAI } from 'openai';
import { config } from '../config/index.js';

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
    this.conversationHistory = [];
  }

  async generateResponse(userMessage) {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: "user",
        content: userMessage
      });

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are NOX, an intelligent and helpful virtual assistant. Respond naturally and concisely in English only."
          },
          ...this.conversationHistory
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      const response = completion.choices[0].message.content;
      
      // Add assistant response to history
      this.conversationHistory.push({
        role: "assistant",
        content: response
      });

      // Keep conversation history manageable
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      return response;
    } catch (error) {
      console.error('OpenAI Error:', error);
      return "Sorry, I encountered an error. Please try again.";
    }
  }
}

// Create singleton instance
export const openAIService = new OpenAIService();