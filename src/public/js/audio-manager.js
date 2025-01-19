export class AudioManager {
  constructor(socket) {
    this.socket = socket;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.stream = null;
  }

  async initialize() {
    try {
      // Arrêter tout stream existant
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      // Demander l'accès au microphone
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      // Vérifier les codecs supportés
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
        'audio/mpeg'
      ];

      let selectedMimeType = null;
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error('Aucun format audio supporté trouvé');
      }

      // Créer une nouvelle instance de MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        try {
          if (this.audioChunks.length > 0) {
            const audioBlob = new Blob(this.audioChunks, { type: selectedMimeType });
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioData = new Uint8Array(arrayBuffer);
            console.log('Sending audio data to server...');
            this.socket.emit('audio-data', audioData);
            this.audioChunks = [];
          }
        } catch (error) {
          console.error('Error processing audio chunks:', error);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
      };
      
      console.log('Audio manager initialized with codec:', selectedMimeType);
      await this.startRecording();
    } catch (error) {
      console.error('Error initializing audio manager:', error);
      throw error;
    }
  }

  async startRecording() {
    if (!this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      try {
        this.audioChunks = [];
        await new Promise((resolve, reject) => {
          try {
            this.mediaRecorder.start();
            this.isRecording = true;
            console.log('Recording started');
            resolve();
          } catch (error) {
            reject(error);
          }
        });
        
        // Arrêter l'enregistrement après 5 secondes
        setTimeout(() => {
          this.stopRecording();
        }, 5000);
      } catch (error) {
        console.error('Error starting recording:', error);
        this.isRecording = false;
        throw error;
      }
    }
  }

  stopRecording() {
    if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.stop();
        this.isRecording = false;
        console.log('Recording stopped');
        
        // Redémarrer l'enregistrement après un court délai
        setTimeout(() => {
          this.startRecording();
        }, 1000);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  }

  cleanup() {
    try {
      this.stopRecording();
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      this.mediaRecorder = null;
      this.isRecording = false;
      this.audioChunks = [];
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}