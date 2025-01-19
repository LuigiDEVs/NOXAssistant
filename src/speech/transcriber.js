import { OpenAI } from 'openai';
import { config } from '../config/index.js';
import { createReadStream } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { FormData } from 'formdata-node';
import { TranscriptionValidator } from './transcription/transcription-validator.js';

export class WhisperTranscriber {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
    this.validator = new TranscriptionValidator();
  }

  async transcribe(audioData) {
    try {
      const tempFile = join(config.audio.outputDir, `temp_${Date.now()}.wav`);
      
      let audioBuffer;
      if (audioData instanceof Blob) {
        const arrayBuffer = await audioData.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
      } else if (Buffer.isBuffer(audioData)) {
        audioBuffer = audioData;
      } else {
        throw new Error('Unsupported audio format');
      }

      await writeFile(tempFile, audioBuffer);

      const transcription = await this.openai.audio.transcriptions.create({
        file: createReadStream(tempFile),
        model: "whisper-1",
        language: "en",
        response_format: "text",
        temperature: 0.3,
        prompt: "Transcription of voice commands in English"
      });

      // Validate and clean transcription
      const cleanTranscription = this.validator.clean(transcription);
      if (!this.validator.isValid(cleanTranscription)) {
        console.log('Invalid transcription ignored:', cleanTranscription);
        return null;
      }

      return cleanTranscription;
    } catch (error) {
      console.error('Transcription error:', error);
      return null;
    }
  }
}