import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Sidebar, type PageId } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Chatbot } from './pages/Chatbot';
import { Reports } from './pages/Reports';
import { Feedback } from './pages/Feedback';
import { Settings } from './pages/Settings';

import { AlertTriangle, Radio, Megaphone, Check } from 'lucide-react';
import { LeafletMap } from './components/LeafletMap';
import { api } from './utils/api';

// Custom Emergency Alerts Manager Page for layout completeness
const EmergencyAlertsManager: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastZone, setBroadcastZone] = useState('Zone 1');
  const [broadcastSeverity, setBroadcastSeverity] = useState('Warning');
  const [broadcastDesc, setBroadcastDesc] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchAlerts();
  }, []);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastDesc.trim()) return;
    
    // Simulate adding an alert
    const newAlert = {
      id: `alert-${Date.now()}`,
      title: broadcastTitle,
      category: 'Emergency',
      severity: broadcastSeverity,
      zone: broadcastZone,
      timestamp: new Date().toISOString(),
      description: broadcastDesc
    };
    
    setAlerts(prev => [newAlert, ...prev]);
    setSuccess('Emergency broadcast sent to citizen portals and IoT signals!');
    setBroadcastTitle('');
    setBroadcastDesc('');
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      <div>
        <h2 className="font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <AlertTriangle className="text-red-500 animate-pulse" />
          Emergency Operations Control
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Monitor critical incidents, dispatch hardware workflows, and broadcast emergency alert notifications to the city
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map view */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col space-y-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Active Hazard Zone Mapping
          </span>
          <LeafletMap viewMode="emergency" alerts={alerts} />
        </div>

        {/* Broadcast portal */}
        <div className="glass-card p-6 border border-slate-200 dark:border-slate-800/80 shadow-md space-y-4 h-fit">
          <div className="flex items-center gap-2 text-red-500">
            <Radio size={18} className="animate-pulse" />
            <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Emergency Broadcast Center
            </h3>
          </div>

          {success && (
            <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold flex items-center gap-1.5">
              <Check size={16} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Alert Heading</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Chemical haze warning"
                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Description Brief</label>
              <textarea
                required
                rows={3}
                value={broadcastDesc}
                onChange={(e) => setBroadcastDesc(e.target.value)}
                placeholder="Details of warning instructions for citizens..."
                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition text-slate-800 dark:text-slate-100 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Zone</label>
                <select
                  value={broadcastZone}
                  onChange={(e) => setBroadcastZone(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition text-slate-800 dark:text-slate-100"
                >
                  <option>Zone 1</option>
                  <option>Zone 2</option>
                  <option>Zone 3</option>
                  <option>Zone 4</option>
                  <option>Zone 5</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Severity</label>
                <select
                  value={broadcastSeverity}
                  onChange={(e) => setBroadcastSeverity(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition text-slate-800 dark:text-slate-100"
                >
                  <option>Warning</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-500/20"
            >
              <Megaphone size={14} />
              <span>Broadcast Alert</span>
            </button>
          </form>
        </div>
      </div>

      {/* Alerts list */}
      <div className="glass-card p-6 border border-slate-200 dark:border-slate-800/80 shadow-md space-y-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Active Emergency Warnings Registry
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-start gap-3`}
            >
              <div className={`p-2 rounded-xl text-white ${alert.severity === 'Critical' ? 'bg-red-500' : 'bg-amber-500'}`}>
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs">{alert.title}</h4>
                  <span className="text-[8px] text-slate-400 font-semibold">{alert.zone}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{alert.description}</p>
                <span className="text-[8px] text-slate-400 font-semibold block pt-1">
                  Alert Active: {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const { t } = useLanguage();

  useEffect(() => {
    const pageTitles: Record<PageId, string> = {
      dashboard: "Dashboard",
      analytics: "Analytics",
      alerts: "Emergency Center",
      reports: "Report Workshop",
      assistant: "AI Assistant",
      feedback: "Citizen Portal",
      settings: "Control Settings"
    };
    const titleText = pageTitles[activePage] || "Platform";
    document.title = `${titleText} | CivicMind AI`;
  }, [activePage]);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <Analytics />;
      case 'alerts':
        return <EmergencyAlertsManager />;
      case 'reports':
        return <Reports />;
      case 'assistant':
        return <Chatbot />;
      case 'feedback':
        return <Feedback />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Collapsible Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={t(activePage)} />
        <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl mx-auto w-full">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [isStarted, setIsStarted] = useState(false);

  if (!isStarted) {
    return <LandingPage onStart={() => setIsStarted(true)} />;
  }

  if (isStarted && !user) {
    return <LoginPage onBack={() => setIsStarted(false)} onSuccess={() => {}} />;
  }

  return <MainLayout />;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
