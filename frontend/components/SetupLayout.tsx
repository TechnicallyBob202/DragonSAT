'use client';

import React, { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard';
import { HistoryView } from './HistoryView';
import { SettingsView } from './SettingsView';
import { SessionModal } from './SessionModal';
import { useProgressStore } from '../hooks/useProgressStore';
import { getOrCreateUser, getUserProgress } from '../utils/api';

type NavSection = 'dashboard' | 'history' | 'settings';

const NAV_ITEMS: Array<{
  section: NavSection;
  label: string;
  icon: string;
  activeBg: string;
  activeShadow: string;
  iconBg: string;
  iconText: string;
}> = [
  {
    section: 'dashboard',
    label: 'LEARN',
    icon: '📚',
    activeBg: 'bg-blue-500',
    activeShadow: 'shadow-blue-200 dark:shadow-blue-900',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconText: 'text-blue-600 dark:text-blue-400',
  },
  {
    section: 'history',
    label: 'PROGRESS',
    icon: '📈',
    activeBg: 'bg-violet-500',
    activeShadow: 'shadow-violet-200 dark:shadow-violet-900',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconText: 'text-violet-600 dark:text-violet-400',
  },
  {
    section: 'settings',
    label: 'SETTINGS',
    icon: '⚙️',
    activeBg: 'bg-slate-500',
    activeShadow: 'shadow-slate-200 dark:shadow-slate-900',
    iconBg: 'bg-slate-100 dark:bg-slate-700',
    iconText: 'text-slate-600 dark:text-slate-400',
  },
];

export function SetupLayout() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [sessionInProgress, setSessionInProgress] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const { setUserId, setSessions, setUserStats, reset } = useProgressStore();

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    reset();
    window.location.reload();
  };

  // Initialize userId + stats from backend so History/Settings work in setup app
  useEffect(() => {
    const initUser = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      try {
        const userData = await getOrCreateUser(userId);
        const canonicalId = userData.user.id as string;
        setUserId(canonicalId);
        const progress = await getUserProgress(canonicalId, 20);
        if (progress.success) {
          setSessions(progress.sessions);
          setUserStats(progress.stats);
        }
      } catch {
        // backend unreachable; ignore
      }
    };
    initUser();
  }, []);

  // Listen for session window messages
  useEffect(() => {
    const refreshProgress = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      try {
        const progress = await getUserProgress(userId, 20);
        if (progress.success) {
          setSessions(progress.sessions);
          setUserStats(progress.stats);
        }
      } catch { /* ignore */ }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SESSION_STARTED') {
        setSessionInProgress(true);
      }
      if (event.data.type === 'SESSION_ENDED') {
        setSessionInProgress(false);
        refreshProgress();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setSessions, setUserStats]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-6">
          <h1 className="text-3xl font-black text-blue-500">DragonSAT</h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">Study. Sharpen. Soar.</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.section}
              item={item}
              isActive={activeSection === item.section}
              onClick={() => setActiveSection(item.section)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
          {username && (
            <p className="px-2 text-xs text-gray-500 dark:text-gray-400 truncate">
              Signed in as <span className="font-semibold text-gray-700 dark:text-gray-300">{username}</span>
            </p>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-2xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <span>↩</span>
            <span>Log Out</span>
          </button>
          <p className="px-2 text-xs text-gray-400 dark:text-gray-600">v0.1.0</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        {renderContent()}
      </div>

      {/* Session in Progress Modal */}
      {sessionInProgress && <SessionModal />}
    </div>
  );
}

interface NavItemProps {
  item: typeof NAV_ITEMS[number];
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ item, isActive, onClick }: NavItemProps) {
  if (isActive) {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${item.activeBg} text-white font-black shadow-md ${item.activeShadow}`}
      >
        <span className="w-9 h-9 flex items-center justify-center rounded-xl text-xl bg-white/20">
          {item.icon}
        </span>
        <span className="text-sm tracking-wide">{item.label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 font-bold"
    >
      <span className={`w-9 h-9 flex items-center justify-center rounded-xl text-xl ${item.iconBg}`}>
        {item.icon}
      </span>
      <span className="text-sm tracking-wide">{item.label}</span>
    </button>
  );
}
