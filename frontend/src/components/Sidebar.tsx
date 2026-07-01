import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  AlertTriangle, 
  FileText, 
  Bot, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export type PageId = 'dashboard' | 'analytics' | 'alerts' | 'reports' | 'assistant' | 'feedback' | 'settings';

interface SidebarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, permission: 'read:dashboard' },
    { id: 'analytics', label: t('analytics'), icon: BarChart3, permission: 'read:analytics' },
    { id: 'alerts', label: t('alerts'), icon: AlertTriangle, permission: 'manage:alerts' },
    { id: 'reports', label: t('reports'), icon: FileText, permission: 'generate:reports' },
    { id: 'assistant', label: t('assistant'), icon: Bot, permission: 'read:dashboard' },
    { id: 'feedback', label: t('feedback'), icon: MessageSquare, permission: 'submit:feedback' },
    { id: 'settings', label: t('settings'), icon: Settings, permission: 'read:dashboard' },
  ] as const;

  // Filter navigation items by user permissions
  const visibleNav = navigationItems.filter(item => {
    if (!user) return item.id === 'dashboard' || item.id === 'feedback';
    return user.permissions.includes(item.permission);
  });

  return (
    <aside 
      className={`h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between sidebar-transition select-none z-30 ${
        collapsed ? 'w-20' : 'w-[260px]'
      }`}
    >
      <div>
        {/* Header / Logo */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="p-2 gradient-primary rounded-xl text-white">
                <ShieldCheck size={20} className="animate-pulse" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                CivicMind AI
              </span>
            </div>
          )}
          {collapsed && (
            <div className="p-2 gradient-primary rounded-xl text-white mx-auto">
              <ShieldCheck size={18} />
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Link List */}
        <nav className="mt-6 px-4 space-y-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-medium text-sm transition-all group ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} 
                />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer */}
      {user && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
          {!collapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold max-w-[120px] truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded-md mt-0.5 w-fit">
                    {user.role}
                  </span>
                </div>
              </div>
              <button 
                onClick={logout}
                title={t('logout')}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={logout}
              title={t('logout')}
              className="mx-auto p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
