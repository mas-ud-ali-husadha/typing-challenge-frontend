import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';
import { typingAPI } from '@/lib/api';

interface TypingTestState {
  text: string;
  textId: string;
  userInput: string;
  startTime: number | null;
  endTime: number | null;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  isFinished: boolean;
  isStarted: boolean;
}

export const useTypingTest = () => {
  const { socket } = useSocket();
  const [state, setState] = useState<TypingTestState>({
    text: '',
    textId: '',
    userInput: '',
    startTime: null,
    endTime: null,
    wpm: 0,
    rawWpm: 0,
    accuracy: 0,
    errors: 0,
    isFinished: false,
    isStarted: false,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const loadNewText = useCallback(async () => {
    try {
      const response = await typingAPI.getText();
      const data = response.data;

      setState((prev) => ({
        ...prev,
        text: data.text,
        textId: data.id,
        userInput: '',
        startTime: null,
        endTime: null,
        wpm: 0,
        rawWpm: 0,
        accuracy: 0,
        errors: 0,
        isFinished: false,
        isStarted: false,
      }));
    } catch (error) {
      console.error('Failed to load text:', error);
    }
  }, []);

  useEffect(() => {
    loadNewText();
  }, [loadNewText]);

  const reset = () => {
    loadNewText();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInput = (value: string) => {
    if (state.isFinished) return;

    const now = Date.now();
    const startTime = state.startTime || now;

    if (!state.isStarted) {
      setState((prev) => ({
        ...prev,
        isStarted: true,
        startTime: now,
      }));
      socket?.emit('typing_start', {
        username: localStorage.getItem('username'),
        textId: state.textId,
      });
    }

    const timeElapsed = now - startTime;

    const errors = value
      .split('')
      .reduce((acc, char, idx) => acc + (char !== state.text[idx] ? 1 : 0), 0);

    const rawWpm = calculateRealTimeRawWPM(value, timeElapsed);
    const wpm = calculateRealTimeWPM(value, errors, timeElapsed);
    const accuracy = calculateRealTimeAccuracy(value, state.text);

    setState((prev) => ({
      ...prev,
      userInput: value,
      wpm,
      rawWpm,
      accuracy,
      errors,
    }));

    socket?.emit('typing_progress', {
      username: localStorage.getItem('username'),
      progress: (value.length / state.text.length) * 100,
      currentWpm: wpm,
      errors,
    });

    if (value.length === state.text.length) {
      finishTest(value, errors, now, startTime);
    }
  };

  const calculateRealTimeRawWPM = (
    typedChars: string,
    timeMs: number
  ): number => {
    if (timeMs === 0) return 0;
    const words = typedChars.length / 5; // 5 characters = 1 word
    const minutes = timeMs / 60000;
    return Math.round(words / minutes);
  };

  const calculateRealTimeWPM = (
    typedChars: string,
    errors: number,
    timeMs: number
  ): number => {
    if (timeMs === 0) return 0;
    const words = typedChars.length / 5; // 5 characters = 1 word
    const minutes = timeMs / 60000;
    const rawWpm = words / minutes;
    const errorPenalty = errors / 5; // Convert errors to "words" for penalty
    const netWpm = Math.max(0, rawWpm - errorPenalty / minutes);
    return Math.round(netWpm);
  };

  const calculateRealTimeAccuracy = (
    typedChars: string,
    originalText: string
  ): number => {
    if (typedChars.length === 0) return 100;
    let correctChars = 0;
    for (let i = 0; i < typedChars.length; i++) {
      if (typedChars[i] === originalText[i]) {
        correctChars++;
      }
    }
    return Math.round((correctChars / typedChars.length) * 100);
  };

  const calculateConsistency = (
    wpm: number,
    typedChars: string,
    errors: number
  ) => {
    const errorPenalty = errors / typedChars.length;
    const adjustedWpm = wpm * (1 - errorPenalty);
    const consistency = 100 - (Math.abs(wpm - adjustedWpm) / wpm) * 100;
    return Math.max(0, Math.round(consistency));
  };

  const finishTest = async (
    finalInput: string,
    errors: number,
    endTime: number,
    startTime: number
  ) => {
    const timeSpent = (endTime - startTime) / 1000;
    const username = localStorage?.getItem('username') || null;
    const rawWpm = calculateRealTimeRawWPM(finalInput, endTime - startTime);
    const wpm = calculateRealTimeWPM(finalInput, errors, endTime - startTime);
    const accuracy = calculateRealTimeAccuracy(finalInput, state.text);
    const consistency = calculateConsistency(wpm, finalInput, errors);

    setState((prev) => ({
      ...prev,
      isFinished: true,
      endTime: endTime,
      wpm,
      rawWpm,
      accuracy,
      consistency,
      errors: errors,
    }));

    try {
      await typingAPI.submitTest({
        username,
        wpm,
        rawWpm,
        accuracy,
        consistency,
        timeSpent,
        textId: state.textId,
        errorCount: errors,
      });
    } catch (error) {
      console.error('Failed to submit result:', error);
    }
  };

  return {
    ...state,
    inputRef,
    handleInput,
    reset,
    loadNewText,
  };
};
