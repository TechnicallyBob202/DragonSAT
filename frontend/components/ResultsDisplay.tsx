'use client';


import { getScoreGrade, getScoreFeedback } from '../utils/scoring';

interface ResultsDisplayProps {
  score: number;
  total: number;
  correct: number;
  onBackToDashboard?: () => void;
}

export function ResultsDisplay({
  score,
  total,
  correct,
  onBackToDashboard,
}: ResultsDisplayProps) {
  const grade = getScoreGrade(score);
  const feedback = getScoreFeedback(score);
  const gradeColor = {
    A: 'text-green-600',
    B: 'text-blue-600',
    C: 'text-yellow-600',
    D: 'text-orange-600',
    F: 'text-red-600',
  }[grade];

  const scoreColor = {
    A: 'bg-green-100 border-green-300',
    B: 'bg-blue-100 border-blue-300',
    C: 'bg-yellow-100 border-yellow-300',
    D: 'bg-orange-100 border-orange-300',
    F: 'bg-red-100 border-red-300',
  }[grade];

  return (
    <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
      <div className="card max-w-lg w-full text-center">
        {/* Grade */}
        <div
          className={`card border-4 ${scoreColor} mb-6 inline-block w-24 h-24 flex items-center justify-center`}
        >
          <div className={`text-6xl font-bold ${gradeColor}`}>{grade}</div>
        </div>

        {/* Score Percentage */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {score.toFixed(1)}%
        </h1>

        {/* Correct Answers */}
        <p className="text-xl text-gray-600 mb-6">
          {correct} out of {total} correct
        </p>

        {/* Feedback */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-8">
          <p className="text-blue-900 font-medium">{feedback}</p>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-3 mb-8">
          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Correct</span>
            <span className="font-bold text-green-600">{correct}</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Incorrect</span>
            <span className="font-bold text-red-600">{total - correct}</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Accuracy</span>
            <span className="font-bold text-gray-900">
              {((correct / total) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onBackToDashboard}
          className="btn-primary w-full"
        >
          Back to Dashboard
        </button>

        {/* Next Steps */}
        <p className="text-sm text-gray-600 mt-6">
          {score >= 80
            ? 'Great work! Try a harder difficulty level next time.'
            : 'Review the material and try again to improve your score.'}
        </p>
      </div>
    </div>
  );
}
