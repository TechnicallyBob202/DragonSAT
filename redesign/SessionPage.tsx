'use client';

import React, { useEffect, useState } from 'react';
import { useAssessmentStore } from '@/hooks/useAssessmentStore';
import { useProgressStore } from '@/hooks/useProgressStore';
import { getOrCreateUser, startSession, endSession, getQuestions } from '@/utils/api';
import { parseQuestions } from '@/utils/questionParser';
import { StudySession } from '@/components/StudySession';
import { QuizSession } from '@/components/QuizSession';
import { TestSession } from '@/components/TestSession';
import { ResultsDisplay } from '@/components/ResultsDisplay';

interface SessionConfig {
  mode: 'study' | 'quiz' | 'test';
  questionCount: number;
  domain?: string;
  difficulty?: string;
}

export default function SessionPage() {
  const assessmentStore = useAssessmentStore();
  const progressStore = useProgressStore();

  const [isInitializing, setIsInitializing] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [sessionResults, setSessionResults] = useState<{
    score: number;
    total: number;
    correct: number;
  } | null>(null);
  const [config, setConfig] = useState<SessionConfig | null>(null);

  // Initialize session from parent window message
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Check sessionStorage for config
        const storedConfig = sessionStorage.getItem('pendingSessionConfig');
        if (!storedConfig) {
          console.error('No session config found');
          return;
        }

        const sessionConfig: SessionConfig = JSON.parse(storedConfig);
        setConfig(sessionConfig);

        // Get or create user
        let userId = localStorage.getItem('userId');
        if (!userId) {
          userId = `user_${Date.now()}`;
          localStorage.setItem('userId', userId);
        }

        assessmentStore.initializeSession(userId, sessionConfig.mode);

        // Get user data
        const userData = await getOrCreateUser(userId);
        progressStore.setUserId(userData.user.id);

        // Start backend session
        const sessionData = await startSession(userId, sessionConfig.mode);
        assessmentStore.setSessionId(sessionData.session.id);

        // Fetch questions
        const questionsData = await getQuestions({
          domain: sessionConfig.domain,
          difficulty: sessionConfig.difficulty,
          limit: sessionConfig.questionCount,
        });

        if (questionsData.success) {
          const parsedQuestions = parseQuestions(questionsData.questions);
          assessmentStore.setQuestions(parsedQuestions);
        }

        // Notify parent window that session has started
        window.opener?.postMessage({ type: 'SESSION_STARTED' }, '*');

        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setIsInitializing(false);
      }
    };

    initializeSession();

    // Listen for config from parent window
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'INIT_SESSION') {
        const sessionConfig: SessionConfig = event.data.config;
        setConfig(sessionConfig);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleCompleteSession = async (score: number, total: number, correct: number) => {
    if (!assessmentStore.sessionId) return;

    try {
      await endSession(assessmentStore.sessionId, score, total, correct);
      setSessionResults({ score, total, correct });
      setShowResults(true);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const handleExit = () => {
    // Notify parent that session ended
    window.opener?.postMessage({ type: 'SESSION_ENDED' }, '*');
    assessmentStore.resetAssessment();
    window.close();
  };

  const handleBackToDashboard = () => {
    handleExit();
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block relative w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
          <p className="text-gray-700 font-medium">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Show results
  if (showResults && sessionResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ResultsDisplay
          score={sessionResults.score}
          total={sessionResults.total}
          correct={sessionResults.correct}
          onBackToDashboard={handleBackToDashboard}
        />
      </div>
    );
  }

  // Show active session
  if (assessmentStore.activeMode === 'study' && assessmentStore.questions.length > 0) {
    return <StudySession onExit={handleExit} />;
  }

  if (assessmentStore.activeMode === 'quiz' && assessmentStore.questions.length > 0) {
    return (
      <QuizSession onComplete={handleCompleteSession} onExit={handleExit} />
    );
  }

  if (assessmentStore.activeMode === 'test' && assessmentStore.questions.length > 0) {
    return (
      <TestSession onComplete={handleCompleteSession} onExit={handleExit} />
    );
  }

  // Fallback
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Session not ready</p>
      </div>
    </div>
  );
}
