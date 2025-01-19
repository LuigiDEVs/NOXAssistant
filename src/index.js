import { createNoxAssistant } from './nox/assistant.js';
import { setupVoiceRecognition } from './speech/recognition.js';
import { setupUI } from './ui/interface.js';

async function main() {
  const nox = await createNoxAssistant();
  const voiceRecognition = setupVoiceRecognition();
  
  // Initialize UI in headless mode
  const ui = setupUI();

  console.log("NOX est initialisé et prêt à recevoir des commandes...");
  
  // Listen for voice commands
  voiceRecognition.on('command', async (command) => {
    await nox.processCommand(command);
    // Update UI state
    ui.update();
  });
  
  // Démarrer l'écoute vocale
  voiceRecognition.start();
}

main().catch(console.error);