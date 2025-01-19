import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { config } from '../../config/index.js';

export async function saveAudioFile(audioData) {
  try {
    // Ensure temp directory exists
    await mkdir(config.audio.outputDir, { recursive: true });
    
    // Handle different audio data formats
    let buffer;
    if (typeof audioData === 'string') {
      if (audioData.startsWith('data:audio')) {
        // Handle base64 data URL
        buffer = Buffer.from(audioData.split('base64,')[1], 'base64');
      } else if (audioData.startsWith('http')) {
        // Handle URL - fetch the audio data
        const response = await fetch(audioData);
        buffer = Buffer.from(await response.arrayBuffer());
      } else {
        // Handle raw base64
        buffer = Buffer.from(audioData, 'base64');
      }
    } else if (Buffer.isBuffer(audioData)) {
      buffer = audioData;
    } else {
      throw new Error('Unsupported audio data format');
    }
    
    // Save audio file with .wav extension
    const filename = `speech_${Date.now()}.wav`;
    const audioPath = join(config.audio.outputDir, filename);
    
    await writeFile(audioPath, buffer);
    return { path: audioPath, filename };
  } catch (error) {
    console.error('Error saving audio file:', error);
    throw error;
  }
}