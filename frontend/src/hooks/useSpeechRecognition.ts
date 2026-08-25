import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export type SpeechState = 'idle' | 'listening' | 'processing' | 'unsupported' | 'error';

interface UseSpeechRecognitionOptions {
  language?: string;
  onResult?: (transcript: string) => void;
}

const LANGUAGE_TAGS: Record<string, string> = {
  english: 'en-IN',
  en: 'en-IN',
  hindi: 'hi-IN',
  hi: 'hi-IN',
  bengali: 'bn-IN',
  bangla: 'bn-IN',
  bn: 'bn-IN',
};

function getLanguageTag(value: string = 'English') {
  return LANGUAGE_TAGS[value.trim().toLowerCase()] || 'en-IN';
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { language = 'English', onResult } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [state, setState] = useState<SpeechState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const onResultRef = useRef(onResult);
  const isListeningRef = useRef(false);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setState('unsupported');
      setErrorMessage(
        'Voice input is not supported by this browser. Please use the latest Chrome or Microsoft Edge.'
      );
      return;
    }

    const recognition = new SpeechRecognitionClass();

    // One answer at a time is more reliable than continuous dictation for a form.
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = getLanguageTag(language);

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      setState('listening');
      setErrorMessage('');
    };

    recognition.onresult = (event: any) => {
      let finalPart = '';
      let interimPart = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result?.[0]?.transcript || '';

        if (result.isFinal) {
          finalPart += text;
        } else {
          interimPart += text;
        }
      }

      if (finalPart) {
        finalTranscriptRef.current =
          `${finalTranscriptRef.current} ${finalPart}`.trim();
      }

      const combined = `${finalTranscriptRef.current} ${interimPart}`.trim();

      if (combined) {
        setTranscript(combined);
        onResultRef.current?.(combined);
      }
    };

    recognition.onerror = (event: any) => {
      const code = event?.error || 'unknown';
      console.warn('Speech recognition error:', code);

      isListeningRef.current = false;
      setIsListening(false);

      const messages: Record<string, string> = {
        'not-allowed':
          'Microphone permission was denied. Click the lock icon beside the website address, allow Microphone, then try again.',
        'service-not-allowed':
          'The browser speech service is unavailable. Please try the latest Chrome or Edge.',
        'audio-capture':
          'No microphone was detected. Connect a microphone and try again.',
        network:
          'Speech recognition could not reach the browser speech service. Check your internet connection and try again.',
        aborted: 'Voice recording was stopped.',
      };

      if (code === 'no-speech') {
        setErrorMessage('No speech was detected. Please speak clearly and try again.');
      } else if (code !== 'aborted') {
        setErrorMessage(messages[code] || `Voice input error: ${code}`);
      }

      setState(code === 'aborted' ? 'idle' : 'error');
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
      setState((current) =>
        current === 'processing' ? 'idle' : current === 'listening' ? 'idle' : current
      );
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      } catch {
        // Browser may already have ended recognition.
      }
      recognitionRef.current = null;
      isListeningRef.current = false;
    };
  }, [language]);

  const startListening = useCallback(async () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setState('unsupported');
      return;
    }

    if (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      setState('error');
      setErrorMessage('Voice input requires HTTPS or localhost.');
      return;
    }

    try {
      // Explicitly request microphone permission first. This fixes many cases
      // where SpeechRecognition silently fails because the browser has not
      // granted microphone access to the page.
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }

      finalTranscriptRef.current = '';
      setTranscript('');
      setErrorMessage('');
      recognition.lang = getLanguageTag(language);

      if (isListeningRef.current) {
        recognition.stop();
        return;
      }

      recognition.start();
    } catch (error: any) {
      console.warn('Unable to start speech recognition:', error);

      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setErrorMessage(
          'Microphone permission was denied. Allow microphone access in your browser and try again.'
        );
      } else if (error?.name === 'NotFoundError') {
        setErrorMessage('No microphone was found on this device.');
      } else {
        setErrorMessage('Could not start voice input. Please try again.');
      }

      setIsListening(false);
      isListeningRef.current = false;
      setState('error');
    }
  }, [language]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !isListeningRef.current) return;

    setState('processing');

    try {
      recognition.stop();
    } catch {
      isListeningRef.current = false;
      setIsListening(false);
      setState('idle');
    }
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setErrorMessage('');
    setState('idle');
  }, []);

  return {
    isListening,
    transcript,
    setTranscript,
    state,
    errorMessage,
    isSupported: state !== 'unsupported',
    startListening,
    stopListening,
    resetTranscript,
  };
}
