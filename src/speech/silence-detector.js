import { EventEmitter } from 'events';

export class SilenceDetector extends EventEmitter {
  constructor(options = {}) {
    super();
    this.threshold = options.threshold || -50;
    this.minSilenceDuration = options.minSilenceDuration || 1500;
    this.silenceStart = null;
    this.isSpeaking = false;
    this.bufferSize = 2048;
    this.sampleRate = 16000;
  }

  setup(stream) {
    // Dans Node.js, nous n'utilisons pas l'API Web Audio
    // À la place, nous analysons directement les données audio reçues
    this.isSpeaking = false;
    this.silenceStart = null;
  }

  // Analyse le niveau sonore à partir des données audio brutes
  analyzeAudioLevel(audioData) {
    // Convertir les données en Float32Array pour le calcul RMS
    const samples = new Float32Array(audioData.length / 2);
    for (let i = 0; i < samples.length; i++) {
      // Convertir les données 16-bit en valeurs flottantes normalisées
      const sample = (audioData[i * 2] | (audioData[i * 2 + 1] << 8)) / 32768.0;
      samples[i] = sample;
    }

    // Calculer le RMS (Root Mean Square)
    let rms = 0;
    for (let i = 0; i < samples.length; i++) {
      rms += samples[i] * samples[i];
    }
    rms = Math.sqrt(rms / samples.length);

    // Convertir en dB
    const db = 20 * Math.log10(Math.max(rms, 1e-10));

    this.processAudioLevel(db);
  }

  processAudioLevel(db) {
    if (db < this.threshold) {
      if (!this.silenceStart) {
        this.silenceStart = Date.now();
      } else if (Date.now() - this.silenceStart >= this.minSilenceDuration && this.isSpeaking) {
        this.isSpeaking = false;
        this.emit('silence');
        this.silenceStart = null;
      }
    } else {
      if (!this.isSpeaking) {
        this.isSpeaking = true;
        this.emit('speech');
      }
      this.silenceStart = null;
    }
  }

  cleanup() {
    this.isSpeaking = false;
    this.silenceStart = null;
  }
}