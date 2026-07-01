import React, { useState, useEffect } from 'react';
import { Sun, Moon, Bell, Globe, Sparkles, LogIn } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, type Language } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

interface NavbarProps {
  onLoginClick?: () => void;
  title: string;
}

interface AlertItem {
  id: string;
  title: string;
  severity: string;
  timestamp: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick, title }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    const fetchNavbarAlerts = async () => {
      try {
        const activeAlerts = await api.getAlerts();
        setAlerts(activeAlerts);
      } catch (e) {
        console.error("Failed to load active navbar alerts", e);
      }
    };
    fetchNavbarAlerts();
    // Refresh alerts every 60 seconds
    const interval = setInterval(fetchNavbarAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const languageNames = {
    en: 'English',
    hi: 'हिन्दी',
    mr: 'मराठी'
  };

  return (
    <header className="h-16 sticky top-0 bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md flex items-center justify-between px-6 z-20 select-none">
      {/* Title / Description */}
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{title}</h1>
        {user?.role && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Sparkles size={10} className="text-blue-500" />
            {user.role} Portal
          </span>
        )}
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2">
        {/* Multilingual Selector */}
        <div className="relative">
          <button
            onClick={() => { setShowLangDropdown(!showLangDropdown); setShowNotifications(false); }}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition"
          >
            <Globe size={18} />
            <span className="text-xs font-semibold uppercase">{language}</span>
          </button>

          {showLangDropdown && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1.5 z-50">
              {(Object.keys(languageNames) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLangDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition ${
                    language === lang 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {languageNames[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Hub */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowLangDropdown(false); }}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition relative"
          >
            <Bell size={18} />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 alert-indicator" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="font-bold text-xs">{t('notifications')}</span>
                <span className="text-[10px] text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full font-bold">
                  {alerts.length} Active
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    No active warnings
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 last:border-b-0 text-left transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${alert.severity === 'Critical' ? 'bg-red-500' : 'bg-amber-500'}`} />
                        <span className="font-semibold text-xs truncate max-w-[200px]">{alert.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Authenticate Trigger (For Guest Mode) */}
        {!user && onLoginClick && (
          <button
            onClick={onLoginClick}
            className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20"
          >
            <LogIn size={14} />
            <span>Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
