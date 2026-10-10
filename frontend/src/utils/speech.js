// BCP-47 Language Tag Mapping
const LANGUAGE_LOCALES = {
  spanish: 'es-ES',
  french: 'fr-FR',
  german: 'de-DE',
  japanese: 'ja-JP',
  italian: 'it-IT',
  russian: 'ru-RU',
  mandarin: 'zh-CN',
  chinese: 'zh-CN',
  english: 'en-US',
  portuguese: 'pt-BR',
  dutch: 'nl-NL',
  korean: 'ko-KR',
  latin: 'it-IT',
};

/**
 * Pronounce a given text in the specified language using native browser Web Speech API.
 * @param {string} text - The word or phrase to pronounce.
 * @param {string} language - The language name (e.g. 'Spanish', 'French').
 * @param {function} onEndCallback - Optional callback when speech finishes.
 * @returns {boolean} - Returns true if speech synthesis was triggered.
 */
export const speakWord = (text, language = 'English', onEndCallback = null) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser.');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const langKey = (language || '').toLowerCase().trim();
  const targetLocale = LANGUAGE_LOCALES[langKey] || 'en-US';
  utterance.lang = targetLocale;

  // Optimized speech rate for language learners (slightly slowed for phonetic clarity)
  utterance.rate = 0.88;
  utterance.pitch = 1.0;

  // Try finding an exact or partial voice match
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) => v.lang.toLowerCase() === targetLocale.toLowerCase() || v.lang.toLowerCase().startsWith(targetLocale.slice(0, 2))
  );

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onEndCallback) {
    utterance.onend = onEndCallback;
    utterance.onerror = onEndCallback;
  }

  window.speechSynthesis.speak(utterance);
  return true;
};

export const isSpeechAvailable = () => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};
