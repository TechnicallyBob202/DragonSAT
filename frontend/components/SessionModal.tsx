'use client';

import React from 'react';

export function SessionModal() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm mx-4">
        <div className="text-center">
          {/* Pulse Animation */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-75"></div>
              <div className="absolute inset-2 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Session in Progress</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your testing session is currently active. Complete it or close the session window to return here.
          </p>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              📝 <strong>Don&apos;t close the session window</strong> without finishing your test or quiz.
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            This setup area will unlock when your session ends.
          </p>
        </div>
      </div>
    </div>
  );
}
