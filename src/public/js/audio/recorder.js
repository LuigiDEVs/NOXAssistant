export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.onDataCallback = null;
  }

  setup(stream, onDataAvailable) {
    this.onDataCallback = onDataAvailable;
    
    // Utiliser MediaRecorder avec codec WAV
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    this.mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        if (this.onDataCallback) {
          this.onDataCallback(blob);
        }
      }
    };
  }

  start() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.audioChunks = [];
      this.mediaRecorder.start(1000); // Envoyer les données toutes les secondes
    }
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  cleanup() {
    this.stop();
    this.audioChunks = [];
  }
}