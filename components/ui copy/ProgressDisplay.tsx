// components/ui/ProgressDisplay.tsx
"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressDisplayProps {
  progress: number;
  title?: string;
  statusTextOverride?: string; // Optional: to set a specific status message from outside
}

export const ProgressDisplay = ({
  progress,
  title = "Generating your masterpiece...",
  statusTextOverride,
}: ProgressDisplayProps) => {
  let currentStatusText = statusTextOverride;

  if (!currentStatusText) {
    if (progress === 0) currentStatusText = "Initializing generation...";
    else if (progress < 10) currentStatusText = "Warming up the AI engines...";
    else if (progress < 30) currentStatusText = "Preparing the digital canvas...";
    else if (progress < 70) currentStatusText = "The AI is currently painting pixels...";
    else if (progress < 95) currentStatusText = "Adding exquisite final details...";
    else if (progress < 100) currentStatusText = "Almost there, preparing your image!";
    else currentStatusText = "Generation complete!";
  }

  return (
    <div
      id="progress-section" // For scrolling
      className="w-full my-8 p-6 md:p-10 bg-white dark:bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700/60"
    >
      <h3 className="text-2xl md:text-3xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6 md:mb-8">
        {title}
      </h3>
      <div className="w-full max-w-3xl mx-auto">
        <Progress
          value={progress}
          className="w-full h-4 md:h-5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-300 ease-linear"
        />
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentStatusText}
          </p>
          <p className="text-lg md:text-xl font-mono font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400">
            {progress}%
          </p>
        </div>
      </div>
    </div>
  );
};