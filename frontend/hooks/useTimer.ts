import { useEffect, useState, useCallback, useRef } from 'react';

export interface UseTimerOptions {
  initialSeconds: number;
  onTick?: (remaining: number) => void;
  onExpire?: () => void;
  autoStart?: boolean;
}

export function useTimer(options: UseTimerOptions) {
  const [isRunning, setIsRunning] = useState(options.autoStart || false);
  const [timeRemaining, setTimeRemaining] = useState(options.initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newInitialTime?: number) => {
    setIsRunning(false);
    setTimeRemaining(newInitialTime ?? options.initialSeconds);
  }, [options.initialSeconds]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(0);
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1);

        if (options.onTick) {
          options.onTick(newTime);
        }

        if (newTime === 0) {
          setIsRunning(false);
          if (options.onExpire) {
            options.onExpire();
          }
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, options]);

  return {
    timeRemaining,
    isRunning,
    start,
    pause,
    reset,
    stop,
  };
}
