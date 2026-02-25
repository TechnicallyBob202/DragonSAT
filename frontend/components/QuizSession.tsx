'use client';

import React, { useEffect } from 'react';
import { QuestionRenderer } from './QuestionRenderer';
import { OptionGroup } from './OptionGroup';
import { ControlBar } from './ControlBar';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { useTimer } from '../hooks/useTimer';
import { calculateQuizTime } from '../utils/timing';

interface QuizSessionProps {
  onComplete?: (score: number, total: number, correct: number) => void;
  onExit?: () => void;
}

export function QuizSession({ onComplete, onExit }: QuizSessionProps) {
  const {
    questions,
    currentQuestionIndex,
    getProgress,
    getCurrentQuestion,
    recordResponse,
    moveToNextQuestion,
    getCorrectCount,
    updateTimeRemaining,
  } = useAssessmentStore();

  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = React.useState(false);

  const quizTime = calculateQuizTime(questions.length);
  const { timeRemaining, isRunning, start, pause } = useTimer({
    initialSeconds: quizTime,
    onTick: updateTimeRemaining,
    onExpire: () => handleTimeExpired(),
    autoStart: false,
  });

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();

  const handleTimeExpired = () => {
    if (currentQuestionIndex < questions.length - 1) {
      moveToNextQuestion();
    } else {
      finishQuiz();
    }
  };

  const handleNext = () => {
    if (selectedAnswer) {
      recordResponse({
        questionId: currentQuestion!.id,
        userAnswer: selectedAnswer,
        isCorrect: selectedAnswer === currentQuestion!.correct_answer,
        timeSpentSeconds: 0,
      });

      if (currentQuestionIndex < questions.length - 1) {
        moveToNextQuestion();
        setSelectedAnswer(null);
      } else {
        finishQuiz();
      }
    }
  };

  const finishQuiz = () => {
    pause();
    const correct = getCorrectCount();
    const total = questions.length;
    const score = (correct / total) * 100;
    if (onComplete) {
      onComplete(score, total, correct);
    }
  };

  if (!sessionStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="card max-w-md">
          <h2 className="text-2xl font-bold mb-4">Quiz Mode</h2>
          <p className="text-gray-600 mb-2">
            Practice with a timer - {Math.ceil(quizTime / 60)} minutes for {questions.length} questions
          </p>
          <p className="text-gray-600 mb-6">
            Immediate feedback only at the end of the quiz.
          </p>
          <button
            onClick={() => {
              setSessionStarted(true);
              start();
            }}
            className="btn-primary w-full mb-2"
          >
            Start Quiz
          </button>
          {onExit && (
            <button onClick={onExit} className="btn-secondary w-full">
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
          <p className="text-gray-600 mb-6">Check your results on the next screen.</p>
        </div>
      </div>
    );
  }

  const choices = [
    { label: `A. ${currentQuestion.choices.A}`, value: 'A' },
    { label: `B. ${currentQuestion.choices.B}`, value: 'B' },
    { label: `C. ${currentQuestion.choices.C}`, value: 'C' },
    { label: `D. ${currentQuestion.choices.D}`, value: 'D' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 max-w-4xl mx-auto w-full p-6">
        <QuestionRenderer question={currentQuestion} />

        <div className="mt-8 space-y-4">
          <OptionGroup
            options={choices}
            selectedValue={selectedAnswer}
            onSelect={setSelectedAnswer}
            disabled={false}
          />
        </div>
      </div>

      <ControlBar
        mode="quiz"
        timeRemaining={timeRemaining}
        showTimer={true}
        currentQuestion={progress.current}
        totalQuestions={progress.total}
        onNext={handleNext}
        canNext={!!selectedAnswer}
      />
    </div>
  );
}
