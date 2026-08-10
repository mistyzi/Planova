import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

type FocusTimerContextType = {
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  hasActiveTimer: boolean;
  startTimer: (seconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  cancelTimer: () => void;
};

const TIMER_STORAGE_KEY = "@sleekfinds_focus_timer";

type StoredTimer = {
  remainingSeconds: number;
  endTime: number | null;
  isRunning: boolean;
};

const FocusTimerContext =
  createContext<FocusTimerContextType | undefined>(
    undefined,
  );

export function FocusTimerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [remainingSeconds, setRemainingSeconds] =
    useState(0);

  const [endTime, setEndTime] =
    useState<number | null>(null);

  const [isRunning, setIsRunning] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);

  /*
   * LOAD SAVED TIMER
   */

  useEffect(() => {
    const loadTimer = async () => {
      try {
        const saved =
          await AsyncStorage.getItem(
            TIMER_STORAGE_KEY,
          );

        if (!saved) {
          return;
        }

        const timer: StoredTimer =
          JSON.parse(saved);

        if (
          timer.isRunning &&
          timer.endTime
        ) {
          const secondsLeft = Math.max(
            0,
            Math.ceil(
              (timer.endTime -
                Date.now()) /
                1000,
            ),
          );

          if (secondsLeft > 0) {
            setRemainingSeconds(
              secondsLeft,
            );
            setEndTime(timer.endTime);
            setIsRunning(true);
            setIsPaused(false);
          } else {
            await AsyncStorage.removeItem(
              TIMER_STORAGE_KEY,
            );
          }
        } else {
          setRemainingSeconds(
            timer.remainingSeconds,
          );
          setIsRunning(false);
          setIsPaused(true);
        }
      } catch (error) {
        console.log(
          "Failed to load focus timer:",
          error,
        );
      }
    };

    loadTimer();
  }, []);

  /*
   * SAVE TIMER
   */

  useEffect(() => {
    const saveTimer = async () => {
      try {
        if (
          remainingSeconds <= 0 &&
          !isRunning &&
          !isPaused
        ) {
          await AsyncStorage.removeItem(
            TIMER_STORAGE_KEY,
          );
          return;
        }

        const timer: StoredTimer = {
          remainingSeconds,
          endTime,
          isRunning,
        };

        await AsyncStorage.setItem(
          TIMER_STORAGE_KEY,
          JSON.stringify(timer),
        );
      } catch (error) {
        console.log(
          "Failed to save focus timer:",
          error,
        );
      }
    };

    saveTimer();
  }, [
    remainingSeconds,
    endTime,
    isRunning,
    isPaused,
  ]);

  /*
   * COUNTDOWN
   */

  useEffect(() => {
    if (
      !isRunning ||
      !endTime
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        const secondsLeft =
          Math.max(
            0,
            Math.ceil(
              (endTime -
                Date.now()) /
                1000,
            ),
          );

        setRemainingSeconds(
          secondsLeft,
        );

        if (secondsLeft <= 0) {
          setIsRunning(false);
          setIsPaused(false);
          setEndTime(null);
        }
      }, 250);

    return () =>
      clearInterval(interval);
  }, [isRunning, endTime]);

  /*
   * START
   */

  const startTimer = (
    seconds: number,
  ) => {
    const newEndTime =
      Date.now() +
      seconds * 1000;

    setRemainingSeconds(seconds);
    setEndTime(newEndTime);
    setIsRunning(true);
    setIsPaused(false);
  };

  /*
   * PAUSE
   */

  const pauseTimer = () => {
    if (!isRunning) {
      return;
    }

    setIsRunning(false);
    setIsPaused(true);
    setEndTime(null);
  };

  /*
   * RESUME
   */

  const resumeTimer = () => {
    if (
      !isPaused ||
      remainingSeconds <= 0
    ) {
      return;
    }

    const newEndTime =
      Date.now() +
      remainingSeconds * 1000;

    setEndTime(newEndTime);
    setIsRunning(true);
    setIsPaused(false);
  };

  /*
   * CANCEL
   */

  const cancelTimer = async () => {
    setRemainingSeconds(0);
    setEndTime(null);
    setIsRunning(false);
    setIsPaused(false);

    try {
      await AsyncStorage.removeItem(
        TIMER_STORAGE_KEY,
      );
    } catch (error) {
      console.log(
        "Failed to cancel focus timer:",
        error,
      );
    }
  };

  const value = useMemo(
    () => ({
      remainingSeconds,
      isRunning,
      isPaused,
      hasActiveTimer:
        remainingSeconds > 0 &&
        (isRunning || isPaused),
      startTimer,
      pauseTimer,
      resumeTimer,
      cancelTimer,
    }),
    [
      remainingSeconds,
      isRunning,
      isPaused,
    ],
  );

  return (
    <FocusTimerContext.Provider
      value={value}
    >
      {children}
    </FocusTimerContext.Provider>
  );
}

export function useFocusTimer() {
  const context =
    useContext(
      FocusTimerContext,
    );

  if (!context) {
    throw new Error(
      "useFocusTimer must be used inside FocusTimerProvider",
    );
  }

  return context;
}