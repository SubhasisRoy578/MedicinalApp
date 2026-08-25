import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { Mic, MicOff, Send, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';
import { Question } from '../../types';

interface VoiceAnswerInputProps {
  question: Question;
  language: string;
  onSubmit: (answerText: string, answerType: 'text' | 'voice' | 'quick_button') => void;
  isSubmitting?: boolean;
}

export const VoiceAnswerInput: React.FC<VoiceAnswerInputProps> = ({
  question,
  language,
  onSubmit,
  isSubmitting = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [usedVoice, setUsedVoice] = useState(false);

  const {
    isListening,
    transcript,
    state: speechState,
    errorMessage: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    language: language,
    onResult: (t) => {
      setInputText(t);
      setUsedVoice(true);
    },
  });

  // Keep inputText updated if transcript updates
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Reset local state when question changes
  useEffect(() => {
    setInputText('');
    setUsedVoice(false);
    resetTranscript();
  }, [question.id]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (isListening) {
      stopListening();
    }

    const type = usedVoice ? 'voice' : 'text';
    onSubmit(inputText.trim(), type);
  };

  const handleQuickOptionClick = (option: string) => {
    setInputText(option);
    onSubmit(option, 'quick_button');
  };

  return (
    <div className="space-y-4">
      {/* Quick Option Buttons (if provided for the question) */}
      {question.options && question.options.length > 0 && (
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Quick Select Options:
          </div>
          <div className="flex flex-wrap gap-2">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickOptionClick(opt)}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-900 transition-all active:scale-95 text-left"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Recording Banner / Waveform Indicator */}
      {isListening && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between animate-pulse-fast">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-1.5 bg-teal-600 rounded-full animate-wave-1"></span>
              <span className="w-1.5 bg-teal-600 rounded-full animate-wave-2"></span>
              <span className="w-1.5 bg-teal-600 rounded-full animate-wave-3"></span>
              <span className="w-1.5 bg-teal-600 rounded-full animate-wave-4"></span>
            </div>
            <span className="text-xs font-bold text-teal-900">Listening... Speak clearly into your microphone</span>
          </div>
          <button
            type="button"
            onClick={stopListening}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 underline"
          >
            Done Speaking
          </button>
        </div>
      )}

      {/* Speech error notice */}
      {speechError && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Main Input Textarea with Embedded Microphone & Submit Button */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative border-2 border-slate-200 focus-within:border-teal-500 rounded-2xl bg-white shadow-sm overflow-hidden transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Type your response or click the microphone to speak in ${language}...`}
            rows={3}
            disabled={isSubmitting}
            className="w-full p-4 pr-24 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none bg-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          {/* Action Bar inside input box */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-2">
              {/* Mic Toggle Button */}
              {isSupported ? (
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                    } else {
                      startListening();
                    }
                  }}
                  disabled={isSubmitting}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-white border border-slate-300 text-slate-700 hover:border-teal-500 hover:text-teal-700'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Stop (Listening...)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-teal-600" />
                      <span>Speak Answer</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 italic">Microphone input available in Chrome/Edge</span>
              )}

              {inputText && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    resetTranscript();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1"
                  title="Clear input"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isSubmitting}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                inputText.trim() && !isSubmitting
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{isSubmitting ? 'Saving...' : 'Submit Answer'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
