'use client';

import { useState } from 'react';

interface SetupOverlayProps {
  mode: 'study' | 'quiz' | 'test';
  domains: string[];
  isLoading?: boolean;
  onStart: (config: SetupConfig) => void;
  onCancel: () => void;
}

export interface SetupConfig {
  questionCount: number;
  section?: string;
  domain?: string;
  difficulty?: string;
}

const SECTIONS = [
  { value: '', label: 'All Sections' },
  { value: 'math', label: 'Math' },
  { value: 'english', label: 'Reading & Writing' },
];

const MATH_DOMAINS = [
  'Algebra',
  'Advanced Math',
  'Geometry and Trigonometry',
  'Problem-Solving and Data Analysis',
];

const ENGLISH_DOMAINS = [
  'Information and Ideas',
  'Craft and Structure',
  'Expression of Ideas',
  'Standard English Conventions',
];

export function SetupOverlay({
  mode,
  domains: _domains,
  isLoading = false,
  onStart,
  onCancel,
}: SetupOverlayProps) {
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
    setSelectedDomain(''); // reset domain when section changes
  };

  const handleStart = () => {
    onStart({
      questionCount,
      section: selectedSection || undefined,
      domain: selectedDomain || undefined,
      difficulty: selectedDifficulty || undefined,
    });
  };

  // Determine which domain list to show based on selected section
  const domainOptions =
    selectedSection === 'math' ? MATH_DOMAINS :
    selectedSection === 'english' ? ENGLISH_DOMAINS :
    [...MATH_DOMAINS, ...ENGLISH_DOMAINS].sort();

  const modeLabels = {
    study: 'Study Mode',
    quiz: 'Quiz Mode',
    test: 'Test Mode',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold mb-6">{modeLabels[mode]} Setup</h2>

        <div className="space-y-5">
          {/* Question Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Section Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SECTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleSectionChange(s.value)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedSection === s.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Domain Selection (shown in study mode or when a section is picked) */}
          {(mode === 'study' || selectedSection) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain (Optional)
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Domains</option>
                {domainOptions.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty (Optional)
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Info Text */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            {mode === 'study' && 'Study mode allows unlimited time and immediate feedback.'}
            {mode === 'quiz' && 'Quiz mode includes a timer and feedback only at the end.'}
            {mode === 'test' && 'Test mode is a full SAT simulation with time limits and no going back.'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Start'}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="btn-secondary flex-1 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
