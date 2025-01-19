import { speak, stopSpeaking } from '../speech/tts.js';
import { executeCommand } from '../system/commands.js';

export async function createNoxAssistant() {
  console.log('Initializing NOX assistant...');
  
  async function processCommand(command) {
    try {
      console.log(`Command received: ${command}`);
      
      // Stop any current speech before responding
      stopSpeaking();
      
      // Execute command and get response
      const result = await executeCommand(command);
      
      // Speak the response
      await speak(result);
    } catch (error) {
      console.error('Error processing command:', error);
    }
  }

  return {
    speak,
    stopSpeaking,
    processCommand
  };
}