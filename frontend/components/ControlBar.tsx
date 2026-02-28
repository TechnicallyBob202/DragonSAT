'use client';


import { formatTimeRemaining, isTimeWarning, isTimeExpired } from '../utils/timing';

interface ControlBarProps {
  mode: 'study' | 'quiz' | 'test' | null;
  timeRemaining?: number;
  showTimer?: boolean;
  onCheckAnswer?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  currentQuestion?: number;
  totalQuestions?: number;
  canCheckAnswer?: boolean;
  canNext?: boolean;
  canPrevious?: boolean;
}

export function ControlBar({
  mode,
  timeRemaining = 0,
  showTimer = true,
  onCheckAnswer,
  onNext,
  onPrevious,
  onSubmit: _onSubmit,
  currentQuestion = 0,
  totalQuestions = 0,
  canCheckAnswer = true,
  canNext = true,
  canPrevious = true,
}: ControlBarProps) {
  const timerClass =
    isTimeExpired(timeRemaining) ? 'timer expired' :
    isTimeWarning(timeRemaining) ? 'timer warning' :
    'timer';

  return (
    <div className="bg-white border-t border-gray-200 p-4 shrink-0">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Progress and Timer */}
        <div className="flex items-center gap-4">
          {totalQuestions > 0 && (
            <div className="text-sm text-gray-600">
              Question {currentQuestion} of {totalQuestions}
            </div>
          )}

          {showTimer && mode && ['quiz', 'test'].includes(mode) && (
            <div className={timerClass}>
              {formatTimeRemaining(timeRemaining)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {mode === 'study' && (
            <>
              {onCheckAnswer && (
                <button
                  onClick={onCheckAnswer}
                  disabled={!canCheckAnswer}
                  className="btn-primary disabled:opacity-50"
                >
                  Check Answer
                </button>
              )}
              {onPrevious && (
                <button
                  onClick={onPrevious}
                  disabled={!canPrevious}
                  className="btn-secondary disabled:opacity-50"
                >
                  Back
                </button>
              )}
              {onNext && (
                <button
                  onClick={onNext}
                  disabled={!canNext}
                  className="btn-primary disabled:opacity-50"
                >
                  {currentQuestion === totalQuestions ? 'Finish' : 'Next'}
                </button>
              )}
            </>
          )}

          {mode === 'quiz' && (
            <>
              {onNext && (
                <button
                  onClick={onNext}
                  disabled={!canNext}
                  className="btn-primary disabled:opacity-50"
                >
                  {currentQuestion === totalQuestions ? 'Submit' : 'Next'}
                </button>
              )}
            </>
          )}

          {mode === 'test' && (
            <>
              {onNext && (
                <button
                  onClick={onNext}
                  disabled={!canNext}
                  className="btn-primary disabled:opacity-50"
                >
                  {currentQuestion === totalQuestions ? 'Review Answers' : 'Next'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
