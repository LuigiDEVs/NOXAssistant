import { EventEmitter } from 'events';
import recorder from 'node-record-lpcm16';

export class AudioRecorder extends EventEmitter {
  constructor() {
    super();
    this.recording = null;
  }

  start() {
    if (this.recording) return;

    console.log('Starting continuous audio recording...');
    
    // Configure recorder
    this.recording = recorder.record({
      sampleRate: 16000,
      channels: 1,
      audioType: 'wav'
    });

    // Stream audio data
    this.recording.stream()
      .on('data', (data) => {
        this.emit('data', data);
      })
      .on('error', (error) => {
        console.error('Recording error:', error);
      });
  }

  stop() {
    if (this.recording) {
      this.recording.stop();
      this.recording = null;
      console.log('Recording stopped');
    }
  }
}