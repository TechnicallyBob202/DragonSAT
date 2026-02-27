'use client';

import React, { useEffect, useState } from 'react';
import { useProgressStore } from '../hooks/useProgressStore';
import { SetupOverlay, SetupConfig } from './SetupOverlay';

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

export function Dashboard() {
  const { userStats } = useProgressStore();
  const [showSetup, setShowSetup] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'study' | 'quiz' | 'test' | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
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
      'hapasat-session',
      'width=1200,height=800,menubar=no,toolbar=no,location=no'
    );

    setShowSetup(false);
    setSelectedMode(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back{username ? `, ${username}` : ''}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Select a mode to begin practicing for the SAT</p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {MODES.map((modeCard) => (
          <button
            key={modeCard.mode}
            onClick={() => handleSelectMode(modeCard.mode)}
            className="group relative overflow-hidden rounded-xl p-6 text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${modeCard.gradient}`}></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="text-4xl mb-3">{modeCard.icon}</div>
              <h3 className="text-xl font-bold text-left mb-2">{modeCard.title}</h3>
              <p className="text-sm text-white/90 text-left">{modeCard.description}</p>
            </div>

            {/* Hover Arrow */}
            <div className="absolute bottom-3 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity text-lg">
              →
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Sessions Completed"
            value={userStats.totalSessions}
            icon="📊"
            bgColor="bg-blue-50"
            textColor="text-blue-700"
          />
          <StatCard
            label="Average Score"
            value={userStats.averageScore ? `${userStats.averageScore.toFixed(1)}%` : 'N/A'}
            icon="📈"
            bgColor="bg-green-50"
            textColor="text-green-700"
          />
          <StatCard
            label="Questions Done"
            value={userStats.totalQuestionsAnswered}
            icon="✓"
            bgColor="bg-purple-50"
            textColor="text-purple-700"
          />
          <StatCard
            label="Correct Answers"
            value={userStats.correctAnswers}
            icon="🎯"
            bgColor="bg-orange-50"
            textColor="text-orange-700"
          />
        </div>
      )}

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

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  bgColor: string;
  textColor: string;
}

function StatCard({ label, value, icon, bgColor, textColor }: StatCardProps) {
  return (
    <div className={`${bgColor} dark:bg-gray-800 rounded-lg p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor} dark:text-gray-300`}>{label}</p>
          <p className={`text-3xl font-bold ${textColor} dark:text-white mt-2`}>{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}
