import React, { useEffect, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  message: string;
  target?: string; // CSS selector for spotlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightMultiple?: string[]; // Multiple elements to highlight
  action?: string; // Expected user action
  autoAction?: 'navigate' | 'flip' | 'scroll'; // Automatic action to perform
}

interface TutorialOverlayProps {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onAutoAction?: (action: string) => void; // Callback for automatic actions
}

export function TutorialOverlay({
  isActive,
  currentStep,
  steps,
  onNext,
  onSkip,
  onComplete,
  onAutoAction,
}: TutorialOverlayProps) {
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [messagePosition, setMessagePosition] = useState({ top: 0, left: 0 });
  const [countdown, setCountdown] = useState(4);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Auto-advance timer (4 seconds)
  useEffect(() => {
    if (!isActive) return;

    // Reset countdown when step changes
    setCountdown(4);

    // Perform auto action if specified
    if (step?.autoAction && onAutoAction) {
      setTimeout(() => {
        onAutoAction(step.autoAction!);
      }, 1000); // Trigger auto action after 1 second
    }

    // Auto-advance after 4 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Advance to next step
          if (isLastStep) {
            onComplete();
          } else {
            onNext();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isActive, currentStep, step, isLastStep, onNext, onComplete, onAutoAction]);

  // Update spotlight position when step changes
  useEffect(() => {
    if (!isActive || !step?.target) {
      setSpotlightRect(null);
      return;
    }

    const updateSpotlight = () => {
      const element = document.querySelector(step.target!);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect(rect);

        // Calculate message position based on step position preference
        const messageTop = step.position === 'top' 
          ? rect.top - 200 
          : step.position === 'bottom'
          ? rect.bottom + 20
          : step.position === 'center'
          ? window.innerHeight / 2 - 100
          : rect.top;

        const messageLeft = step.position === 'left'
          ? rect.left - 350
          : step.position === 'right'
          ? rect.right + 20
          : step.position === 'center'
          ? window.innerWidth / 2 - 200
          : rect.left;

        setMessagePosition({ 
          top: Math.max(20, Math.min(messageTop, window.innerHeight - 250)),
          left: Math.max(20, Math.min(messageLeft, window.innerWidth - 420))
        });
      }
    };

    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight, true);

    return () => {
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight, true);
    };
  }, [isActive, step, currentStep]);

  if (!isActive) return null;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Four overlays creating a cutout around the spotlight area */}
      {spotlightRect ? (
        <>
          {/* Top overlay */}
          <div
            className="absolute bg-black/75 pointer-events-auto"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: Math.max(0, spotlightRect.top - 8),
            }}
          />
          
          {/* Left overlay */}
          <div
            className="absolute bg-black/75 pointer-events-auto"
            style={{
              top: Math.max(0, spotlightRect.top - 8),
              left: 0,
              width: Math.max(0, spotlightRect.left - 8),
              height: spotlightRect.height + 16,
            }}
          />
          
          {/* Right overlay */}
          <div
            className="absolute bg-black/75 pointer-events-auto"
            style={{
              top: Math.max(0, spotlightRect.top - 8),
              left: spotlightRect.right + 8,
              right: 0,
              height: spotlightRect.height + 16,
            }}
          />
          
          {/* Bottom overlay */}
          <div
            className="absolute bg-black/75 pointer-events-auto"
            style={{
              top: spotlightRect.bottom + 8,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          
          {/* Spotlight border highlight - pointer-events-none to allow clicks through */}
          <div
            className="absolute border-4 border-blue-500 rounded-lg animate-pulse pointer-events-none"
            style={{
              top: spotlightRect.top - 8,
              left: spotlightRect.left - 8,
              width: spotlightRect.width + 16,
              height: spotlightRect.height + 16,
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.5)',
            }}
          />
        </>
      ) : (
        // Full screen overlay when no spotlight
        <div className="absolute inset-0 bg-black/75 pointer-events-auto" />
      )}

      {/* Tutorial message card */}
      <div
        className="absolute bg-white rounded-lg shadow-2xl p-6 w-96 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{
          top: messagePosition.top,
          left: messagePosition.left,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
            <p className="text-xs text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Skip tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-700 mb-6 leading-relaxed">{step.message}</p>

        {/* Action hint */}
        {step.action && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 font-medium">
              👉 {step.action}
            </p>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-4 justify-center">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-blue-600'
                  : index < currentStep
                  ? 'w-1.5 bg-blue-300'
                  : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip Tutorial
          </button>
          <div className="flex items-center gap-3">
            {/* Countdown indicator */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">{countdown}</span>
              </div>
              <span className="text-xs text-gray-500">Auto-advancing...</span>
            </div>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              {isLastStep ? 'Finish Now' : 'Next'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

