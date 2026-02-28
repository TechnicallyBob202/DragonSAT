'use client';



interface Option {
  label: string;
  value: string;
}

interface OptionGroupProps {
  options: Option[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
  correctAnswer?: string;
  showCorrect?: boolean;
  userAnswer?: string | null;
}

export function OptionGroup({
  options,
  selectedValue,
  onSelect,
  disabled = false,
  correctAnswer,
  showCorrect = false,
  userAnswer,
}: OptionGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        const isCorrect = correctAnswer === option.value;
        const isUserAnswer = userAnswer === option.value;

        let buttonClass = 'option-button border-gray-300';

        if (showCorrect) {
          if (isCorrect) {
            buttonClass = 'option-button correct';
          } else if (isUserAnswer && !isCorrect) {
            buttonClass = 'option-button incorrect';
          }
        } else if (isSelected) {
          buttonClass = 'option-button selected';
        }

        return (
          <button
            key={option.value}
            onClick={() => !disabled && onSelect(option.value)}
            disabled={disabled}
            className={`${buttonClass} ${disabled ? 'opacity-75' : 'hover:border-blue-500'}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
