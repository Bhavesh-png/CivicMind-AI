import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Moon, Sun, Globe, Bell, Key, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, type Language } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  
  // Notification states
  const [alerts, setAlerts] = useState({
    flood: true,
    traffic: true,
    pollution: true,
    disease: false,
    power: true
  });
  
  const [apiKey, setApiKey] = useState('AIzaSyD-exampleKey********************');
  const [savedKey, setSavedKey] = useState(false);

  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedKey(true);
    setTimeout(() => setSavedKey(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 text-left select-none">
      
      {/* Header */}
      <div>
        <h2 className="font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <SettingsIcon className="text-blue-500" />
          Settings Panel
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure profile settings, regional language parameters, themes, and alert channels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Profile & Themes */}
        <div className="space-y-6">
          
          {/* User profile details */}
          {user && (
            <div className="glass-card p-6 border border-slate-200 dark:border-slate-800/80 shadow-md space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <User size={18} className="text-blue-500" />
                <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Session Profile
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center text-lg shadow-md">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{user.name}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{user.email}</span>
                </div>
              </div>

              {/* Permissions list */}
              <div className="space-y-2 pt-2 text-xs">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Clearances</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.permissions.map((p, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Localization & styling */}
          <div className="glass-card p-6 border border-slate-200 dark:border-slate-800/80 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Globe size={18} className="text-blue-500" />
              <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Display & Language Options
              </h3>
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between gap-4 text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">Application Language</span>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                {(['en', 'hi', 'mr'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                      language === lang 
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {lang === 'en' ? 'English' : lang === 'hi' ? 'हिन्दी' : 'मराठी'}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">Visual Theme</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Alerts & API Key */}
        <div className="space-y-6">
          
          {/* Active alert subscriptions */}
          <div className="glass-card p-6 border border-slate-200 dark:border-slate-800/80 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Bell size={18} className="text-blue-500" />
              <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Alert Channels Subscription
              </h3>
            </div>

            <div className="space-y-3.5 text-xs font-semibold">
              {(Object.keys(alerts) as Array<keyof typeof alerts>).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize text-slate-600 dark:text-slate-300">
                    {key === 'power' ? 'Power Grid Failures' : key === 'flood' ? 'Flood & Water Warning' : `${key} Warnings`}
                  </span>
                  <button
                    onClick={() => toggleAlert(key)}
                    className={`h-6 w-11 rounded-full p-0.5 transition ${
                      alerts[key] ? 'bg-blue-600 flex justify-end' : 'bg-slate-200 dark:bg-slate-700 flex justify-start'
                    }`}
                  >
                    <span className="h-5 w-5 bg-white rounded-full shadow" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Gemini API key configuration */}
          <div className="glass-card p-6 border border-slate-200 dark:border-slate-800/80 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Key size={18} className="text-blue-500" />
              <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Google Cloud Developer Key
              </h3>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-3 text-xs font-semibold">
              <div className="space-y-1 text-left">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Gemini API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow shadow-blue-500/10"
              >
                {savedKey ? (
                  <>
                    <Check size={14} />
                    <span>Saved Developer Key</span>
                  </>
                ) : (
                  <span>Update Developer Keys</span>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
