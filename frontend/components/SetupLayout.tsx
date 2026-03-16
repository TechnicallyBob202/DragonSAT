'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dashboard } from './Dashboard';
import { HistoryView } from './HistoryView';
import { SettingsView } from './SettingsView';
import { AdminView } from './AdminView';
import { SessionModal } from './SessionModal';
import { useProgressStore } from '../hooks/useProgressStore';
import { getOrCreateUser, getUserProgress } from '../utils/api';

type NavSection = 'dashboard' | 'history' | 'settings' | 'admin';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const { setUserId, setSessions, setUserStats, reset } = useProgressStore();

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
    setRole(localStorage.getItem('role'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
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
  }, [setUserId, setSessions, setUserStats]);

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

  const navigateTo = (section: NavSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      case 'admin':
        return <AdminView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-black text-blue-500">DragonSAT</h1>
      </div>

      {/* Sidebar Backdrop (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-800 flex flex-col transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-blue-500">DragonSAT</h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">Study. Sharpen. Soar.</p>
          </div>
          <Image src="/logo.png" alt="DragonSAT" width={40} height={40} className="object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.section}
              item={item}
              isActive={activeSection === item.section}
              onClick={() => navigateTo(item.section)}
            />
          ))}
          {role === 'admin' && (
            <NavItem
              item={{
                section: 'admin',
                label: 'ADMIN',
                icon: '🛡️',
                activeBg: 'bg-red-500',
                activeShadow: 'shadow-red-200 dark:shadow-red-900',
                iconBg: 'bg-red-100 dark:bg-red-900/40',
                iconText: 'text-red-600 dark:text-red-400',
              }}
              isActive={activeSection === 'admin'}
              onClick={() => navigateTo('admin')}
            />
          )}
        </nav>

        {/* Sponsor Link */}
        <div className="px-4 pb-2">
          <a
            href="https://github.com/sponsors/TechnicallyBob202"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 dark:text-gray-500 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
          >
            <span>💖</span>
            <span>Support DragonSAT</span>
          </a>
        </div>

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
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 pt-14 md:pt-0">
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
