'use client';

import React, { useState, useEffect } from 'react';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { useProgressStore } from '../hooks/useProgressStore';
import { useQuestions } from '../hooks/useQuestions';
import { parseQuestions } from '../utils/questionParser';
import {
  getOrCreateUser,
  startSession,
  endSession,
  getQuestions,
} from '../utils/api';
import { Dashboard } from './Dashboard';
import { SetupOverlay, SetupConfig } from './SetupOverlay';
import { StudySession } from './StudySession';
import { QuizSession } from './QuizSession';
import { TestSession } from './TestSession';
import { ResultsDisplay } from './ResultsDisplay';

export type AssessmentMode = 'study' | 'quiz' | 'test' | null;

export function AssessmentEngine() {
  const assessmentStore = useAssessmentStore();
  const progressStore = useProgressStore();
  const { domains, isLoading: domainsLoading } = useQuestions();

  const [currentMode, setCurrentMode] = useState<AssessmentMode>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sessionResults, setSessionResults] = useState<{
    score: number;
    total: number;
    correct: number;
  } | null>(null);

  // Initialize user
  useEffect(() => {
    const initializeUser = async () => {
      try {
        let userId = localStorage.getItem('userId');
        if (!userId) {
          userId = `user_${Date.now()}`;
          localStorage.setItem('userId', userId);
        }

        const userData = await getOrCreateUser(userId);
        progressStore.setUserId(userData.user.id);
        assessmentStore.initializeSession(userData.user.id, null);
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    };

    initializeUser();
  }, []);

  const handleSelectMode = (mode: AssessmentMode) => {
    setCurrentMode(mode);
    setShowSetup(true);
  };

  const handleStartSession = async (config: SetupConfig) => {
    if (!currentMode || !assessmentStore.userId) return;

    setIsInitializing(true);

    try {
      // Start backend session
      const sessionData = await startSession(
        assessmentStore.userId,
        currentMode
      );
      assessmentStore.setSessionId(sessionData.session.id);

      // Fetch questions
      const questionsData = await getQuestions({
        domain: config.domain,
        difficulty: config.difficulty,
        limit: config.questionCount,
      });

      if (questionsData.success) {
        const parsedQuestions = parseQuestions(questionsData.questions);
        assessmentStore.setQuestions(parsedQuestions);
      }

      setShowSetup(false);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start session. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleCompleteSession = async (score: number, total: number, correct: number) => {
    if (!assessmentStore.sessionId) return;

    try {
      await endSession(
        assessmentStore.sessionId,
        score,
        total,
        correct
      );

      setSessionResults({ score, total, correct });
      setShowResults(true);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentMode(null);
    setShowSetup(false);
    setShowResults(false);
    setSessionResults(null);
    assessmentStore.resetAssessment();
  };

  // Show results screen
  if (showResults && sessionResults) {
    return (
      <ResultsDisplay
        score={sessionResults.score}
        total={sessionResults.total}
        correct={sessionResults.correct}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  // Show active session
  if (assessmentStore.activeMode === 'study' && assessmentStore.questions.length > 0) {
    return (
      <StudySession onExit={handleBackToDashboard} />
    );
  }

  if (assessmentStore.activeMode === 'quiz' && assessmentStore.questions.length > 0) {
    return (
      <QuizSession
        onComplete={handleCompleteSession}
        onExit={handleBackToDashboard}
      />
    );
  }

  if (assessmentStore.activeMode === 'test' && assessmentStore.questions.length > 0) {
    return (
      <TestSession
        onComplete={handleCompleteSession}
        onExit={handleBackToDashboard}
      />
    );
  }

  // Show setup overlay
  if (showSetup && currentMode) {
    return (
      <div className="relative">
        <Dashboard onSelectMode={handleSelectMode} />
        <SetupOverlay
          mode={currentMode}
          domains={domains}
          isLoading={isInitializing || domainsLoading}
          onStart={handleStartSession}
          onCancel={() => {
            setShowSetup(false);
            setCurrentMode(null);
          }}
        />
      </div>
    );
  }

  // Show dashboard
  return <Dashboard onSelectMode={handleSelectMode} />;
}
