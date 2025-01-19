export class BrowserMicrophone {
  constructor() {
    this.stream = null;
    this.recorder = null;
    this.socket = null;
    this.isRecording = false;
  }

  async initialize(socket) {
    this.socket = socket;
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        },
        video: false 
      });
      
      this.setupRecording();
      console.log('Microphone initialized successfully');
    } catch (error) {
      console.error('Error initializing microphone:', error);
      throw error;
    }
  }

  setupRecording() {
    // Utiliser le format WAV directement
    this.recorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/wav'
    });
    
    let chunks = [];
    
    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
        // Créer un blob WAV et l'envoyer
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        this.socket.emit('audio-data', audioBlob);
        chunks = [];
      }
    };

    // Enregistrement continu avec intervalles plus courts
    this.recorder.start(500);
    this.isRecording = true;
    console.log('Recording started');
  }

  stop() {
    if (this.recorder && this.isRecording) {
      this.recorder.stop();
      this.isRecording = false;
      console.log('Recording stopped');
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}