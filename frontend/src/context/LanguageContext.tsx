import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi' | 'mr';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
  };
}

export const translations: Translations = {
  // Sidebar
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डैशबोर्ड' },
  analytics: { en: 'Analytics', hi: 'विश्लेषण', mr: 'विश्लेषण' },
  alerts: { en: 'Emergency Alerts', hi: 'आपातकालीन अलर्ट', mr: 'आपातकालीन अलर्ट' },
  reports: { en: 'AI Reports', hi: 'एआई रिपोर्ट', mr: 'एआई अहवाल' },
  assistant: { en: 'AI Assistant', hi: 'एआई सहायक', mr: 'एआय सहाय्यक' },
  feedback: { en: 'Citizen Feedback', hi: 'नागरिक प्रतिक्रिया', mr: 'नागरिक अभिप्राय' },
  settings: { en: 'Settings', hi: 'सेटिंग्स', mr: 'सेटिंग्ज' },
  logout: { en: 'Log Out', hi: 'लॉग आउट', mr: 'लॉग आउट' },

  // Navbar
  welcome: { en: 'Welcome back', hi: 'आपका स्वागत है', mr: 'आपले स्वागत आहे' },
  notifications: { en: 'Notifications', hi: 'सूचनाएं', mr: 'सूचना' },
  profile: { en: 'Profile', hi: 'प्रोफ़ाइल', mr: 'प्रोफाइल' },

  // Dashboard Metrics
  traffic_congestion: { en: 'Traffic Congestion', hi: 'यातायात भीड़', mr: 'रहदारी कोंडी' },
  air_quality: { en: 'Air Quality (AQI)', hi: 'वायु गुणवत्ता (AQI)', mr: 'हवेची गुणवत्ता (AQI)' },
  healthcare_alerts: { en: 'Healthcare Capacity', hi: 'स्वास्थ्य सेवा क्षमता', mr: 'आरोग्य सेवा क्षमता' },
  feedback_total: { en: 'Citizen Feedback', hi: 'नागरिक शिकायतें', mr: 'नागरिक तक्रारी' },
  utilities_usage: { en: 'Power & Water Load', hi: 'बिजली और पानी लोड', mr: 'वीज आणि पाणी लोड' },
  weather: { en: 'Weather Status', hi: 'मौसम की स्थिति', mr: 'हवामान स्थिती' },
  active_alerts: { en: 'Critical Incidents', hi: 'महत्वपूर्ण घटनाएं', mr: 'महत्त्वाच्या घटना' },
  smart_recommendations: { en: 'Smart Policy Engine', hi: 'स्मार्ट नीति इंजन', mr: 'स्मार्ट धोरण इंजिन' },

  // General Actions / Words
  submit: { en: 'Submit', hi: 'जमा करें', mr: 'सादर करा' },
  download: { en: 'Download PDF', hi: 'पीडीएफ डाउनलोड करें', mr: 'पीडीएफ डाउनलोड करा' },
  generating: { en: 'Generating...', hi: 'तैयार किया जा रहा है...', mr: 'तयार होत आहे...' },
  generate: { en: 'Generate Report', hi: 'रिपोर्ट बनाएं', mr: 'अहवाल तयार करा' },
  preview: { en: 'Preview Suggestion', hi: 'सुझाव पूर्वावलोकन', mr: 'सुझाव पूर्वदृश्य' },
  category: { en: 'Category', hi: 'श्रेणी', mr: 'वर्ग' },
  priority: { en: 'Priority', hi: 'प्राथमिकता', mr: 'प्राधान्य' },
  status: { en: 'Status', hi: 'स्थिति', mr: 'स्थिती' },
  sentiment: { en: 'Sentiment', hi: 'भावना', mr: 'भावना' },
  summary: { en: 'Summary', hi: 'सारांश', mr: 'सारांश' },
  title: { en: 'Title', hi: 'शीर्षक', mr: 'शीर्षक' },
  description: { en: 'Description', hi: 'विवरण', mr: 'वर्णन' },
  zone: { en: 'Zone/Area', hi: 'क्षेत्र/इलाका', mr: 'क्षेत्र/भाग' },
  action: { en: 'Action Needed', hi: 'कार्रवाई आवश्यक', mr: 'कृती आवश्यक' },
  resolve: { en: 'Resolve Task', hi: 'कार्य हल करें', mr: 'काम सोडवा' },
  resolved: { en: 'Resolved', hi: 'सुलझा हुआ', mr: 'सोडवले' },
  in_progress: { en: 'In Progress', hi: 'प्रगति पर', mr: 'प्रगतीपथावर' },
  pending: { en: 'Pending', hi: 'लंबित', mr: 'लंबित' },
  
  // Chat
  chat_placeholder: { en: 'Ask CivicMind AI a question...', hi: 'सिविकमाइंड एआई से प्रश्न पूछें...', mr: 'सिविकमाइंड एआय ला प्रश्न विचारा...' },
  voice_assistant: { en: 'Voice Assistant', hi: 'आवाज सहायक', mr: 'आवाज सहाय्यक' },
  suggested_queries: { en: 'Suggested Queries', hi: 'सुझाए गए प्रश्न', mr: 'सुचवलेले प्रश्न' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'hi' || saved === 'mr') return saved;
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const term = translations[key];
    if (!term) return key;
    return term[language] || term['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
