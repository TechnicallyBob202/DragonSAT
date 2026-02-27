'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  section?: string;
  domain?: string;
  difficulty?: string;
}

export default function SessionPage() {
  const assessmentStore = useAssessmentStore();
  const progressStore = useProgressStore();
  const sessionEndedRef = useRef(false);

  const [isInitializing, setIsInitializing] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [sessionResults, setSessionResults] = useState<{
    score: number;
    total: number;
    correct: number;
  } | null>(null);
  const initializedRef = useRef(false);

  // Notify parent whenever this window unloads (force-close, navigate away, etc.)
  useEffect(() => {
    const handleBeforeUnload = () => {
      window.opener?.postMessage({ type: 'SESSION_ENDED' }, '*');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect((): void | (() => void) => {
    if (initializedRef.current) return undefined;
    initializedRef.current = true;

    const initializeSession = async (config: SessionConfig) => {
      try {
        let userId = localStorage.getItem('userId');
        if (!userId) {
          userId = `user_${Date.now()}`;
          localStorage.setItem('userId', userId);
        }

        assessmentStore.initializeSession(userId, config.mode);

        const userData = await getOrCreateUser(userId);
        progressStore.setUserId(userData.user.id);

        const sessionData = await startSession(userId, config.mode);
        assessmentStore.setSessionId(sessionData.session.id);

        const questionsData = await getQuestions({
          section: config.section,
          domain: config.domain,
          difficulty: config.difficulty,
          limit: config.questionCount,
        });

        if (questionsData.success) {
          const parsedQuestions = parseQuestions(questionsData.questions);
          assessmentStore.setQuestions(parsedQuestions);
        }

        window.opener?.postMessage({ type: 'SESSION_STARTED' }, '*');
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setIsInitializing(false);
      }
    };

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') as 'study' | 'quiz' | 'test' | null;
    const questionCount = parseInt(params.get('questionCount') || '10');
    const section = params.get('section') || undefined;
    const domain = params.get('domain') || undefined;
    const difficulty = params.get('difficulty') || undefined;

    let cleanup: (() => void) | undefined;

    if (mode) {
      initializeSession({ mode, questionCount, section, domain, difficulty });
    } else {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'INIT_SESSION') {
          initializeSession(event.data.config);
        }
      };

      window.addEventListener('message', handleMessage);
      cleanup = () => window.removeEventListener('message', handleMessage);
    }

    return cleanup;
  }, [assessmentStore, progressStore]);

  // Called by quiz/test when the session finishes with a score
  const handleCompleteSession = async (score: number, total: number, correct: number) => {
    if (!assessmentStore.sessionId) return;

    try {
      await endSession(assessmentStore.sessionId, score, total, correct);
      sessionEndedRef.current = true;
      setSessionResults({ score, total, correct });
      setShowResults(true);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  // Called when user exits (study complete, Back to Dashboard, results close)
  const handleExit = async () => {
    // End backend session if not already ended (study mode, early exit)
    if (!sessionEndedRef.current && assessmentStore.sessionId) {
      try {
        const correct = assessmentStore.getCorrectCount();
        const total = assessmentStore.questions.length;
        const score = total > 0 ? (correct / total) * 100 : 0;
        await endSession(assessmentStore.sessionId, score, total, correct);
        sessionEndedRef.current = true;
      } catch {
        // best-effort; don't block the window from closing
      }
    }
    window.opener?.postMessage({ type: 'SESSION_ENDED' }, '*');
    assessmentStore.resetAssessment();
    window.close();
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block relative w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-75"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
          <p className="text-gray-700 font-medium">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (showResults && sessionResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ResultsDisplay
          score={sessionResults.score}
          total={sessionResults.total}
          correct={sessionResults.correct}
          onBackToDashboard={handleExit}
        />
      </div>
    );
  }

  if (assessmentStore.activeMode === 'study' && assessmentStore.questions.length > 0) {
    return <StudySession onExit={handleExit} />;
  }

  if (assessmentStore.activeMode === 'quiz' && assessmentStore.questions.length > 0) {
    return <QuizSession onComplete={handleCompleteSession} onExit={handleExit} />;
  }

  if (assessmentStore.activeMode === 'test' && assessmentStore.questions.length > 0) {
    return <TestSession onComplete={handleCompleteSession} onExit={handleExit} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Session not ready. Please close this window and try again.</p>
      </div>
    </div>
  );
}
