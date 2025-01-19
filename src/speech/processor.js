import { WhisperTranscriber } from './transcriber.js';

const transcriber = new WhisperTranscriber();
let isProcessing = false;

export async function processAudioData(audioData) {
  if (isProcessing) {
    console.log('Already processing audio, skipping...');
    return null;
  }

  try {
    isProcessing = true;
    const transcript = await transcriber.transcribe(audioData);
    
    // Accepter toutes les commandes, pas seulement celles avec "nox"
    if (transcript && transcript.trim().length > 0) {
      console.log('Detected speech:', transcript);
      return transcript;
    }
    
    return null;
  } catch (error) {
    console.error('Error processing audio:', error);
    return null;
  } finally {
    isProcessing = false;
  }
}