import { cn } from '@/lib/utils';

interface StepItem {
  id: number;
  label: string;
}

interface ProgressBarProps {
  currentStep: number;
  steps?: StepItem[];
}

export default function ProgressBar({ currentStep, steps = [] }: ProgressBarProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                currentStep >= step.id ? 'bg-[#4A90E2] text-white' : 'bg-gray-200 text-gray-600'
              )}
            >
              {step.id}
            </div>
            <span
              className={cn(
                'mt-2 text-sm',
                currentStep === step.id ? 'text-[#4A90E2] font-medium' : 'text-gray-500'
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative mt-4">
        <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full"></div>
        <div
          className="absolute top-0 left-0 h-1 bg-[#4A90E2] transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
