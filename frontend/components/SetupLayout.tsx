'use client';

import React, { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard';
import { HistoryView } from './HistoryView';
import { SettingsView } from './SettingsView';
import { SessionModal } from './SessionModal';

type NavSection = 'dashboard' | 'history' | 'settings';

export function SetupLayout() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [sessionInProgress, setSessionInProgress] = useState(false);

  // Listen for session window messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SESSION_STARTED') {
        setSessionInProgress(true);
      }
      if (event.data.type === 'SESSION_ENDED') {
        setSessionInProgress(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        {/* App Header */}
        <div className="px-6 py-8 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">HapaSAT</h1>
          <p className="text-xs text-gray-500 mt-1">SAT Prep Companion</p>
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
        <div className="px-6 py-4 border-t border-gray-200 text-xs text-gray-500">
          <p>v0.1.0</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
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
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
