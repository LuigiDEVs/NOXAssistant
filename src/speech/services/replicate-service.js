import Replicate from "replicate";
import { config } from '../../config/index.js';

// Initialize Replicate client
const replicate = new Replicate({
  auth: config.replicate.apiToken,
});

export async function generateSpeech(text, language = "fr") {
  try {
    console.log('Generating speech with XTTS-v2:', text);
    const output = await replicate.run(
      config.replicate.model,
      {
        input: {
          text: text,
          speaker: config.replicate.speaker,
          language: language
        }
      }
    );

    if (!output) {
      throw new Error('No output received from Replicate');
    }

    console.log('Speech generation successful');
    return output;
  } catch (error) {
    console.error('Error generating speech with Replicate:', error);
    throw error;
  }
}