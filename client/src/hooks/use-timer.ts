import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAudio } from "./use-audio";
import { useToast } from "./use-toast";
import type { Session } from "@shared/schema";

type TimerMode = '30min' | '50min' | 'custom';
type SessionType = 'work' | 'break';

export function useTimer() {
  const [timeRemaining, setTimeRemaining] = useState(50 * 60); // 50 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<TimerMode>('50min');
  const [currentSessionIndex, setCurrentSessionIndex] = useState(1);
  const [sessionType, setSessionType] = useState<SessionType>('work');

  const queryClient = useQueryClient();
  const { playBell } = useAudio();
  const { toast } = useToast();

  const { data: activeSession } = useQuery<Session | null>({
    queryKey: ['/api/sessions/active'],
    refetchInterval: isRunning ? 1000 : false,
  });

  const createSessionMutation = useMutation({
    mutationFn: (session: Omit<Session, 'id'>) =>
      apiRequest('POST', '/api/sessions', session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/active'] });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<Session>) =>
      apiRequest('PATCH', `/api/sessions/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/active'] });
    },
  });

  const getSessionDuration = useCallback(() => {
    switch (currentMode) {
      case '30min': return 30;
      case '50min': return 50;
      case 'custom': return 25; // Default custom duration
      default: return 50;
    }
  }, [currentMode]);

  const totalSessions = 4;
  const sessionDuration = getSessionDuration();
  const progress = ((sessionDuration * 60 - timeRemaining) / (sessionDuration * 60)) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    playBell();
    
    if (activeSession && 'id' in activeSession) {
      updateSessionMutation.mutate({
        id: activeSession.id,
        completed: true,
        endTime: new Date(),
      });
    }

    // Determine next session type
    if (sessionType === 'work') {
      if (currentSessionIndex >= totalSessions) {
        // Long break after complete cycle
        setSessionType('break');
        setTimeRemaining(30 * 60); // 30 minute long break
        setCurrentSessionIndex(1);
      } else {
        // Short break
        setSessionType('break');
        setTimeRemaining(10 * 60); // 10 minute short break
      }
    } else {
      // Back to work
      setSessionType('work');
      setTimeRemaining(sessionDuration * 60);
      if (currentSessionIndex < totalSessions) {
        setCurrentSessionIndex(prev => prev + 1);
      }
    }

    toast({
      title: `${sessionType === 'work' ? 'Work' : 'Break'} Session Complete!`,
      description: `Starting ${sessionType === 'work' ? 'break' : 'work'} session`,
    });
  }, [activeSession, sessionType, currentSessionIndex, sessionDuration, playBell, toast, updateSessionMutation]);

  const startSession = useCallback(() => {
    createSessionMutation.mutate({
      userId: '', // Will be set by backend
      type: sessionType,
      duration: sessionType === 'work' ? sessionDuration : timeRemaining / 60,
      startTime: new Date(),
      endTime: null,
      completed: false,
      distractions: [],
      taskId: null,
    });
  }, [sessionType, sessionDuration, timeRemaining, createSessionMutation]);

  const toggleTimer = useCallback(() => {
    if (!isRunning && !activeSession && sessionType === 'work') {
      startSession();
    }
    setIsRunning(!isRunning);
  }, [isRunning, activeSession, sessionType, startSession]);

  const skipSession = useCallback(() => {
    setIsRunning(false);
    handleSessionComplete();
  }, [handleSessionComplete]);

  const resetSession = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(sessionDuration * 60);
    
    if (activeSession && 'id' in activeSession) {
      updateSessionMutation.mutate({
        id: activeSession.id,
        completed: false,
        endTime: null,
      });
    }
  }, [sessionDuration, activeSession, updateSessionMutation]);

  const switchMode = useCallback((mode: TimerMode) => {
    setCurrentMode(mode);
    setIsRunning(false);
    setSessionType('work');
    setCurrentSessionIndex(1);
    
    const newDuration = mode === '30min' ? 30 : mode === '50min' ? 50 : 25;
    setTimeRemaining(newDuration * 60);
  }, []);

  const startQuickSession = useCallback(() => {
    if (!isRunning) {
      setSessionType('work');
      setTimeRemaining(sessionDuration * 60);
      startSession();
      setIsRunning(true);
    }
  }, [isRunning, sessionDuration, startSession]);

  return {
    // State
    timeRemaining,
    isRunning,
    currentMode,
    currentSession: activeSession,
    currentSessionIndex,
    totalSessions,
    sessionType,
    sessionDuration,
    progress,
    
    // Actions
    toggleTimer,
    skipSession,
    resetSession,
    switchMode,
    startQuickSession,
  };
}
