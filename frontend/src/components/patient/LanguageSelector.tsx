import React from 'react';
import { Globe, Check } from 'lucide-react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  greeting: string;
  description: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: 'English',
    name: 'English',
    nativeName: 'English',
    greeting: 'Hello! I am your AI Health Assistant.',
    description: 'Ask and answer clinical questions in standard English'
  },
  {
    code: 'Hindi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    greeting: 'नमस्ते! मैं आपका एआई स्वास्थ्य सहायक हूँ।',
    description: 'हिंदी में प्रश्न पूछें और अपने लक्षणों का वर्णन करें'
  },
  {
    code: 'Bengali',
    name: 'Bengali',
    nativeName: 'বাংলা',
    greeting: 'নমস্কার! আমি আপনার এআই স্বাস্থ্য সহকারী।',
    description: 'বাংলা ভাষায় সহজ কথোপকথনে স্বাস্থ্য তথ্য দিন'
  }
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
  onContinue: () => void;
  isLoading?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onContinue,
  isLoading = false,
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-slide-up">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
            <Globe className="w-7 h-7 text-teal-100" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Choose Your Language</h2>
            <p className="text-xs text-teal-100 mt-0.5">अपनी भाषा चुनें / আপনার ভাষা নির্বাচন করুন</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => onSelectLanguage(lang.code)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/50 shadow-md shadow-teal-500/10'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                <div>
                  <div className="text-xl font-black text-slate-800">{lang.nativeName}</div>
                  <div className="text-xs font-semibold text-teal-700 mt-0.5">{lang.name}</div>
                  <div className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {lang.description}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600 italic">
                  "{lang.greeting.slice(0, 30)}..."
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onContinue}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-md shadow-teal-600/20"
          >
            {isLoading ? 'Setting Language...' : `Start Interview in ${selectedLanguage} →`}
          </button>
        </div>
      </div>
    </div>
  );
};
