export class SilenceDetector extends EventTarget {
  constructor(options = {}) {
    super();
    this.threshold = options.threshold || -50;
    this.minSilenceDuration = options.minSilenceDuration || 1500;
    this.silenceStart = null;
    this.isSpeaking = false;
    this.audioContext = null;
    this.analyser = null;
  }

  on(event, callback) {
    this.addEventListener(event, callback);
  }

  emit(event) {
    this.dispatchEvent(new Event(event));
  }

  setup(stream) {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);
    
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    
    this.startDetection();
  }

  startDetection() {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    
    const checkLevel = () => {
      this.analyser.getFloatTimeDomainData(dataArray);
      
      let rms = 0;
      for (let i = 0; i < bufferLength; i++) {
        rms += dataArray[i] * dataArray[i];
      }
      rms = Math.sqrt(rms / bufferLength);
      const db = 20 * Math.log10(rms);
      
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
      
      requestAnimationFrame(checkLevel);
    };
    
    checkLevel();
  }

  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}