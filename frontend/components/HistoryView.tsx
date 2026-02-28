'use client';

import { useEffect } from 'react';
import { useProgressStore } from '../hooks/useProgressStore';
import { getUserProgress } from '../utils/api';

export function HistoryView() {
  const { userId, recentSessions, userStats, setSessions, setUserStats } = useProgressStore();

  useEffect(() => {
    const loadHistory = async () => {
      if (!userId) return;

      try {
        const data = await getUserProgress(userId, 20);
        if (data.success) {
          setSessions(data.sessions);
          setUserStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };

    loadHistory();
  }, [userId]);

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'study': return 'bg-blue-100 text-blue-800';
      case 'quiz': return 'bg-purple-100 text-purple-800';
      case 'test': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'study': return '📚';
      case 'quiz': return '📝';
      case 'test': return '🎯';
      default: return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Session History</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Review your past sessions and track your progress</p>
      </div>

      {/* Overall Stats */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatBox label="Total Sessions" value={userStats.totalSessions} color="blue" />
          <StatBox
            label="Average Score"
            value={userStats.averageScore ? `${userStats.averageScore.toFixed(1)}%` : 'N/A'}
            color="green"
          />
          <StatBox label="Questions Answered" value={userStats.totalQuestionsAnswered} color="purple" />
          <StatBox label="Correct Answers" value={userStats.correctAnswers} color="orange" />
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Sessions</h3>
        </div>

        {recentSessions.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentSessions.map((session) => (
              <div key={session.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getModeIcon(session.mode)}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {session.mode.charAt(0).toUpperCase() + session.mode.slice(1)} Mode
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(session.start_time)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {session.score != null && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{session.score.toFixed(1)}%</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {session.correct_answers}/{session.total_questions}
                        </p>
                      </div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getModeColor(session.mode)}`}>
                      {session.mode}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No sessions yet. Start practicing to build your history!</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatBox({ label, value, color }: StatBoxProps) {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  };

  return (
    <div className={`${colorMap[color]} rounded-2xl p-5`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-75">{label}</p>
      <p className="text-2xl font-black mt-2">{value}</p>
    </div>
  );
}
