import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  replicate: {
    apiToken: 'apireplicate',
    model: 'lucataco/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e',
    speaker: 'https://replicate.delivery/pbxt/Jt79w0xsT64R1JsiJ0LQRL8UcWspg5J4RFrU6YwEKpOT1ukS/male.wav'
  },
  openai: {
    apiKey: 'apiopenai'
  },
  audio: {
    outputDir: join(__dirname, '../../temp')
  }
};
