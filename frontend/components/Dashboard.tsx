'use client';

import React, { useState } from 'react';
import { useProgressStore } from '../hooks/useProgressStore';

interface ModeCard {
  mode: 'study' | 'quiz' | 'test';
  title: string;
  description: string;
  color: string;
  icon: string;
}

const MODES: ModeCard[] = [
  {
    mode: 'study',
    title: 'Study Mode',
    description: 'Learn at your own pace with immediate feedback',
    color: 'bg-blue-100 border-blue-300',
    icon: '📚',
  },
  {
    mode: 'quiz',
    title: 'Quiz Mode',
    description: 'Practice with a timer and mid-session feedback',
    color: 'bg-purple-100 border-purple-300',
    icon: '📝',
  },
  {
    mode: 'test',
    title: 'Test Mode',
    description: 'Full SAT simulation with realistic timing',
    color: 'bg-red-100 border-red-300',
    icon: '🎯',
  },
];

interface DashboardProps {
  onSelectMode: (mode: 'study' | 'quiz' | 'test') => void;
}

export function Dashboard({ onSelectMode }: DashboardProps) {
  const { userStats, recentSessions } = useProgressStore();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">HapaSAT</h1>
          <p className="text-gray-600 mt-2">Your SAT Prep Companion</p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {MODES.map((modeCard) => (
            <button
              key={modeCard.mode}
              onClick={() => onSelectMode(modeCard.mode)}
              className={`card-hover border-2 ${modeCard.color} text-left`}
            >
              <div className="text-4xl mb-3">{modeCard.icon}</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {modeCard.title}
              </h2>
              <p className="text-gray-700">{modeCard.description}</p>
            </button>
          ))}
        </div>

        {/* Stats Section */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-3xl font-bold text-blue-900">
                {userStats.totalSessions}
              </div>
              <p className="text-blue-700 text-sm">Total Sessions</p>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-3xl font-bold text-green-900">
                {userStats.averageScore ? userStats.averageScore.toFixed(1) : 'N/A'}%
              </div>
              <p className="text-green-700 text-sm">Average Score</p>
            </div>

            <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-3xl font-bold text-purple-900">
                {userStats.totalQuestionsAnswered}
              </div>
              <p className="text-purple-700 text-sm">Questions Done</p>
            </div>

            <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="text-3xl font-bold text-orange-900">
                {userStats.correctAnswers}
              </div>
              <p className="text-orange-700 text-sm">Correct Answers</p>
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Sessions</h3>
            <div className="space-y-2">
              {recentSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {session.mode.charAt(0).toUpperCase() + session.mode.slice(1)} Mode
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.start_time).toLocaleDateString()}
                    </p>
                  </div>
                  {session.score !== undefined && (
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{session.score.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">
                        {session.correct_answers}/{session.total_questions}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
