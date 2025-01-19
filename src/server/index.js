import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { audioPipeline } from '../speech/pipeline.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
export const io = new Server(server);

app.use(express.static(join(__dirname, '../public')));
app.use('/audio', express.static(join(__dirname, '../../temp')));

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('audio-data', async (audioData) => {
    try {
      console.log('Received audio data from client');
      // Convertir les données en Buffer si ce n'est pas déjà fait
      const buffer = Buffer.isBuffer(audioData) ? audioData : Buffer.from(audioData);
      await audioPipeline.processAudio(buffer);
    } catch (error) {
      console.error('Error processing audio data:', error);
      socket.emit('error', { message: 'Error processing audio' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});