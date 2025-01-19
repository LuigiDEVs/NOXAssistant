export class TranscriptionValidator {
  constructor() {
    // Mots ou phrases à ignorer
    this.invalidPatterns = [
      'sous-titres',
      'amara.org',
      'communauté',
      'réalisés par',
      'traduit par',
      'transcrit par',
      'traduction',
      'transcription'
    ];
    
    // Longueur minimale d'une transcription valide
    this.minLength = 2;
  }

  isValid(transcript) {
    if (!transcript || typeof transcript !== 'string') {
      return false;
    }

    const text = transcript.toLowerCase().trim();
    
    // Vérifier la longueur minimale
    if (text.length < this.minLength) {
      return false;
    }

    // Vérifier les motifs invalides
    for (const pattern of this.invalidPatterns) {
      if (text.includes(pattern.toLowerCase())) {
        console.log(`Transcription invalide détectée: ${text}`);
        return false;
      }
    }

    return true;
  }

  clean(transcript) {
    if (!transcript) return '';
    
    // Nettoyer les caractères spéciaux et les espaces multiples
    let cleaned = transcript
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\u00C0-\u017F]/g, ''); // Garde les lettres, chiffres, espaces et accents
      
    return cleaned;
  }
}