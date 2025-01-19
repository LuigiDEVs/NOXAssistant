import { createReadStream } from 'fs';
import { Readable } from 'stream';

export class AudioPlayer {
  constructor() {
    this.currentStream = null;
  }

  async playAudio(audioPath) {
    try {
      // Create a readable stream from the audio file
      const stream = createReadStream(audioPath);
      
      // Store current stream
      this.currentStream = stream;
      
      // Return the stream for piping to audio output
      return stream;
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  stop() {
    if (this.currentStream) {
      this.currentStream.destroy();
      this.currentStream = null;
    }
  }
}