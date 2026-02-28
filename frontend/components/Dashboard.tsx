'use client';

import React, { useEffect, useState } from 'react';
import { useProgressStore } from '../hooks/useProgressStore';
import { SetupOverlay, SetupConfig } from './SetupOverlay';
import { getAnalytics } from '../utils/api';

interface ModeCard {
  mode: 'study' | 'quiz' | 'test';
  title: string;
  description: string;
  gradient: string;
  icon: string;
}

const MODES: ModeCard[] = [
  {
    mode: 'study',
    title: 'Study Mode',
    description: 'Learn at your own pace with immediate feedback',
    gradient: 'from-blue-400 to-blue-600',
    icon: '📚',
  },
  {
    mode: 'quiz',
    title: 'Quiz Mode',
    description: 'Practice with a timer and end-of-session feedback',
    gradient: 'from-purple-400 to-purple-600',
    icon: '📝',
  },
  {
    mode: 'test',
    title: 'Test Mode',
    description: 'Full SAT simulation with realistic timing',
    gradient: 'from-red-400 to-red-600',
    icon: '🎯',
  },
];

interface DomainStat {
  domain: string;
  section: string;
  total: number;
  correct: number;
  accuracy_pct: number;
}

export function Dashboard() {
  const { userStats } = useProgressStore();
  const [showSetup, setShowSetup] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'study' | 'quiz' | 'test' | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [analyticsStats, setAnalyticsStats] = useState<DomainStat[]>([]);

  useEffect(() => {
    setDisplayName(localStorage.getItem('name') || localStorage.getItem('username'));
    getAnalytics()
      .then((data) => { if (data.success) setAnalyticsStats(data.stats); })
      .catch(() => {});
  }, []);

  const handleSelectMode = (mode: 'study' | 'quiz' | 'test') => {
    setSelectedMode(mode);
    setShowSetup(true);
  };

  const handleStartSession = (config: SetupConfig) => {
    if (!selectedMode) return;

    const params = new URLSearchParams({
      mode: selectedMode,
      questionCount: config.questionCount.toString(),
      ...(config.section && { section: config.section }),
      ...(config.domain && { domain: config.domain }),
      ...(config.difficulty && { difficulty: config.difficulty }),
    });

    window.open(
      `/session?${params.toString()}`,
      'dragonsat-session',
      'width=1200,height=800,menubar=no,toolbar=no,location=no'
    );

    setShowSetup(false);
    setSelectedMode(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
          Welcome back{displayName ? `, ${displayName}` : ''}!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-semibold">Select a mode to begin practicing for the SAT</p>
      </div>

      {/* Stats Strip */}
      {userStats && (
        <div className="flex items-center mb-10 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <StatBadge icon="🏆" value={userStats.totalSessions} label="Sessions" />
          <Divider />
          <StatBadge icon="⚡" value={`${Math.round(userStats.averageScore ?? 0)}%`} label="Avg Score" />
          <Divider />
          <StatBadge icon="✅" value={userStats.totalQuestionsAnswered} label="Questions" />
          <Divider />
          <StatBadge icon="🎯" value={userStats.correctAnswers} label="Correct" />
        </div>
      )}

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {MODES.map((modeCard) => (
          <button
            key={modeCard.mode}
            onClick={() => handleSelectMode(modeCard.mode)}
            className="group relative overflow-hidden rounded-2xl p-8 text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-100"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${modeCard.gradient}`}></div>

            {/* Content */}
            <div className="relative z-10 text-left">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-75 mb-1 block">
                {modeCard.mode} mode
              </span>
              <div className="text-6xl mb-4">{modeCard.icon}</div>
              <h3 className="text-xl font-black mb-2">{modeCard.title}</h3>
              <p className="text-sm text-white/90">{modeCard.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Domain Analytics */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Performance by Domain</h3>
        {analyticsStats.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Complete some sessions to see your domain breakdown.
          </p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wide">Domain</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wide">Section</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wide">Answered</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wide">Correct</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wide">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {analyticsStats.map((stat, i) => (
                  <tr key={stat.domain} className={i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-700/30'}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{stat.domain}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        stat.section === 'math'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      }`}>
                        {stat.section === 'math' ? 'Math' : 'English'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{stat.total}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{stat.correct}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${
                        stat.accuracy_pct >= 80 ? 'text-green-600 dark:text-green-400' :
                        stat.accuracy_pct >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {stat.accuracy_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Setup Overlay */}
      {showSetup && selectedMode && (
        <SetupOverlay
          mode={selectedMode}
          domains={[]}
          onStart={handleStartSession}
          onCancel={() => {
            setShowSetup(false);
            setSelectedMode(null);
          }}
        />
      )}
    </div>
  );
}

function StatBadge({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center py-2 px-3">
      <span className="text-xl mb-0.5">{icon}</span>
      <span className="text-lg font-black text-gray-900 dark:text-white leading-tight">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-10 bg-gray-100 dark:bg-gray-700 flex-shrink-0" />;
}
