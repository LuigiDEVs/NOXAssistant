import { EventEmitter } from 'events';
import { AudioRecorder } from './recorder.js';
import { WhisperTranscriber } from './transcriber.js';

export class VoiceRecognition extends EventEmitter {
  constructor() {
    super();
    this.recorder = new AudioRecorder();
    this.transcriber = new WhisperTranscriber();
    this.isListening = false;
    this.WAKE_WORD = 'nox';
    
    // Handle audio data
    this.recorder.on('data', async (audioData) => {
      try {
        const transcript = await this.transcriber.transcribe(audioData);
        if (transcript) {
          const text = transcript.toLowerCase();
          
          // Check for wake word
          if (text.includes(this.WAKE_WORD)) {
            this.emit('wake');
            this.emit('command', text);
          }
        }
      } catch (error) {
        console.error('Transcription error:', error);
      }
    });
  }

  start() {
    if (this.isListening) return;
    
    console.log('Starting continuous voice recognition...');
    this.isListening = true;
    this.recorder.start();
    this.emit('start');
  }

  stop() {
    if (!this.isListening) return;
    
    this.isListening = false;
    this.recorder.stop();
    this.emit('stop');
  }
}

export function setupVoiceRecognition() {
  const recognition = new VoiceRecognition();
  
  // Start listening immediately and keep running
  recognition.start();
  
  // Handle wake word detection
  recognition.on('wake', () => {
    console.log('Wake word detected: NOX');
  });
  
  return recognition;
}