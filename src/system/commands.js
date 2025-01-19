import { openAIService } from '../services/openai-service.js';

export async function executeCommand(command) {
  // Special help command
  if (command.toLowerCase().includes('help')) {
    return "You can talk to me naturally. I can answer your questions and help you with various tasks.";
  }
  
  // For all other commands, use OpenAI
  try {
    const response = await openAIService.generateResponse(command);
    return response;
  } catch (error) {
    console.error('Error executing command:', error);
    return "I'm sorry, I'm having trouble understanding. Could you rephrase that?";
  }
}