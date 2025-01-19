import { generateSpeech } from './services/replicate-service.js';
import { saveAudioFile } from './utils/audio-utils.js';
import { io } from '../server/index.js';

export async function speak(text) {
  try {
    console.log('Generating speech for:', text);
    
    const output = await generateSpeech(text);
    if (!output) {
      throw new Error('No audio output generated');
    }

    const { filename } = await saveAudioFile(output);
    console.log('Audio saved as:', filename);
    
    // Send audio URL to connected clients
    const audioUrl = `/audio/${filename}`;
    io.emit('audio', { url: audioUrl });
    
    return audioUrl;
  } catch (error) {
    console.error('Erreur lors de la synthèse vocale:', error);
    throw error;
  }
}

export function stopSpeaking() {
  io.emit('stop-audio');
}