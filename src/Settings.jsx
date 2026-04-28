import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Settings as SettingsIcon, Globe, MessageSquare, Palette, Sun, Moon, Check, ChevronRight } from 'lucide-react';

const TABS = [
  { id: 'customize', label: 'Customize', icon: Palette },
  { id: 'languages', label: 'Languages', icon: Globe },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('customize');
  const [language, setLanguage] = useState(() => localStorage.getItem('malum_language') || 'en');
  const [feedback, setFeedback] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('malum_language', lang);
    setSavedMessage('Language preference saved.');
    setTimeout(() => setSavedMessage(''), 2500);
  };

  const handleFeedbackSubmit = () => {
    if (!feedback.trim()) return;
    setSavedMessage('Thanks for your feedback!');
    setFeedback('');
    setTimeout(() => setSavedMessage(''), 2500);
  };

  // Theme-aware classes
  const isDark = theme === 'dark';
  const card = 'theme-bg-secondary theme-border';
  const cardHover = 'hover:theme-bg-secondary';
  const textPrimary = 'theme-text';
  const textSecondary = 'theme-text-secondary';
  const textMuted = 'theme-text-muted';
  const inputBg = 'theme-bg theme-border theme-text placeholder-gray-500';
  const tabActive = 'bg-gradient-to-r from-indigo-600/15 to-purple-600/15 theme-text shadow-sm';
  const tabInactive = 'theme-text-muted hover:theme-text hover:theme-bg-secondary';

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'ko', name: 'Korean', native: '한국어' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
  ];

  return (
    <div className={`min-h-screen p-6 md:p-10 font-sans theme-bg`}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary} flex items-center gap-3`}>
            <SettingsIcon className={`w-6 h-6 ${textSecondary}`} />
            Settings
          </h1>
          <p className={`mt-1 text-sm ${textSecondary}`}>Customize your Malum experience.</p>
        </div>

        {/* Tab Bar */}
        <div className={`flex gap-1 p-1 rounded-xl border ${card}`}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 justify-center
                ${activeTab === tab.id ? tabActive : tabInactive}
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toast */}
        {savedMessage && (
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-medium">
            <Check className="w-4 h-4" />
            {savedMessage}
          </div>
        )}

        {/* Customize Tab */}
        {activeTab === 'customize' && (
          <div className="space-y-4">
            <div className={`rounded-xl border p-6 ${card}`}>
              <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>Appearance</h2>
              <p className={`text-sm ${textSecondary} mb-6`}>Choose how Malum looks to you.</p>

              <div className="grid grid-cols-2 gap-4">
                {/* Dark Mode Card */}
                <button
                  onClick={() => setTheme('dark')}
                  className={`relative rounded-xl border-2 p-5 text-left transition-all
                    ${theme === 'dark'
                      ? 'border-indigo-500 bg-indigo-500/5'
                      : isDark ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {theme === 'dark' && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-lg bg-[#0A0A0F] border border-white/10 flex items-center justify-center mb-3">
                    <Moon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <p className={`font-semibold text-sm ${textPrimary}`}>Dark</p>
                  <p className={`text-xs ${textMuted} mt-0.5`}>Easy on the eyes</p>
                </button>

                {/* Light Mode Card */}
                <button
                  onClick={() => setTheme('light')}
                  className={`relative rounded-xl border-2 p-5 text-left transition-all
                    ${theme === 'light'
                      ? 'border-indigo-500 bg-indigo-500/5'
                      : isDark ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {theme === 'light' && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-3">
                    <Sun className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className={`font-semibold text-sm ${textPrimary}`}>Light</p>
                  <p className={`text-xs ${textMuted} mt-0.5`}>Classic clean look</p>
                </button>
              </div>
            </div>

            {/* Accent Color (future placeholder) */}
            <div className={`rounded-xl border p-6 ${card} opacity-50`}>
              <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>Accent Color</h2>
              <p className={`text-sm ${textSecondary}`}>Coming soon — pick your brand color.</p>
            </div>
          </div>
        )}

        {/* Languages Tab */}
        {activeTab === 'languages' && (
          <div className={`rounded-xl border ${card} overflow-hidden`}>
            <div className="p-5 border-b border-inherit">
              <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>Language</h2>
              <p className={`text-sm ${textSecondary}`}>Choose your preferred display language.</p>
            </div>
            <div className="divide-y divide-inherit">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${cardHover}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${textPrimary}`}>{lang.name}</span>
                    <span className={`text-xs ${textMuted}`}>{lang.native}</span>
                  </div>
                  {language === lang.code ? (
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <ChevronRight className={`w-4 h-4 ${textMuted}`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className={`rounded-xl border p-6 ${card}`}>
            <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>Send Feedback</h2>
            <p className={`text-sm ${textSecondary} mb-5`}>Help us improve Malum. We read every message.</p>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What's on your mind? Bug reports, feature ideas, anything..."
              className={`w-full h-36 rounded-xl border p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors ${inputBg}`}
            />

            <div className="mt-4 flex items-center justify-between">
              <p className={`text-xs ${textMuted}`}>
                {feedback.length}/1000 characters
              </p>
              <button
                onClick={handleFeedbackSubmit}
                disabled={!feedback.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
