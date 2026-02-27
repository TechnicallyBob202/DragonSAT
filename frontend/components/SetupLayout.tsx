'use client';

import React, { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard';
import { HistoryView } from './HistoryView';
import { SettingsView } from './SettingsView';
import { SessionModal } from './SessionModal';
import { useProgressStore } from '../hooks/useProgressStore';
import { getOrCreateUser, getUserProgress } from '../utils/api';

type NavSection = 'dashboard' | 'history' | 'settings';

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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col">
        {/* App Header */}
        <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HapaSAT</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">SAT Prep Companion</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem
            label="Dashboard"
            icon="📊"
            isActive={activeSection === 'dashboard'}
            onClick={() => setActiveSection('dashboard')}
          />
          <NavItem
            label="History"
            icon="📈"
            isActive={activeSection === 'history'}
            onClick={() => setActiveSection('history')}
          />
          <NavItem
            label="Settings"
            icon="⚙️"
            isActive={activeSection === 'settings'}
            onClick={() => setActiveSection('settings')}
          />
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {username && (
            <p className="px-2 text-xs text-gray-500 dark:text-gray-400 truncate">
              Signed in as <span className="font-medium text-gray-700 dark:text-gray-300">{username}</span>
            </p>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span>↩</span>
            <span>Log Out</span>
          </button>
          <p className="px-2 text-xs text-gray-400 dark:text-gray-600">v0.1.0</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
        {renderContent()}
      </div>

      {/* Session in Progress Modal */}
      {sessionInProgress && <SessionModal />}
    </div>
  );
}

interface NavItemProps {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ label, icon, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
