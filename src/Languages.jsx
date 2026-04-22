import React, { useState } from 'react';

export default function Languages() {
  const [language, setLanguage] = useState('en');
  const [feedback, setFeedback] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = () => {
    setSavedMessage(`Saved: language=${language} and feedback received.`);
    setTimeout(() => setSavedMessage(''), 3500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-4xl font-black">Settings</h1>
        <p className="mt-2 text-lg text-slate-300">Language Settings</p>

        <section className="mt-8">
          <label className="block text-sm font-semibold text-slate-200" htmlFor="language-select">
            Choose your language
          </label>
          <select
            id="language-select"
            className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 p-2 text-white focus:border-indigo-500 focus:outline-none"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="hi">हिन्दी</option>
          </select>
          <p className="mt-2 text-sm text-slate-400">Current language: {language}</p>
        </section>

        <section className="mt-8">
          <label className="block text-sm font-semibold text-slate-200" htmlFor="feedback">
            Feedback (help us improve)
          </label>
          <textarea
            id="feedback"
            className="mt-2 h-28 w-full rounded-lg border border-slate-600 bg-slate-800 p-2 text-white focus:border-indigo-500 focus:outline-none"
            placeholder="Tell us what you’d like to see in language settings..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </section>

        <div className="mt-6 flex items-center justify-between">
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
            onClick={handleSave}
          >
            Save Settings
          </button>
          {savedMessage && <span className="text-sm text-emerald-300">{savedMessage}</span>}
        </div>
      </div>
    </div>
  );
}
