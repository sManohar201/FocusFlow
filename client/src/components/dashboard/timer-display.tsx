import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, SkipForward, Coffee, Target, Plus } from "lucide-react";
import { useTimer } from "@/hooks/use-timer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type TimerMode = '30min' | '50min' | 'custom';

export function TimerDisplay() {
  const {
    timeRemaining,
    isRunning,
    currentMode,
    currentSessionIndex,
    totalSessions,
    sessionType,
    sessionDuration,
    progress,
    toggleTimer,
    skipSession,
    resetSession,
    switchMode,
    startQuickSession,
  } = useTimer();

  const [showDistraction, setShowDistraction] = useState(false);
  const [distraction, setDistraction] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logDistractionMutation = useMutation({
    mutationFn: (data: { sessionId: string; description: string }) =>
      apiRequest('POST', '/api/distractions', data),
    onSuccess: () => {
      setShowDistraction(false);
      setDistraction('');
      toast({
        title: "Distraction logged",
        description: "Keep focusing on your current session",
      });
    }
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogDistraction = () => {
    if (!distraction.trim()) return;
    
    // For now, use a mock session ID since we don't have active session tracking
    logDistractionMutation.mutate({
      sessionId: 'current-session',
      description: distraction,
    });
  };

  const modeOptions = [
    { value: '30min', label: '30 Minutes' },
    { value: '50min', label: '50 Minutes' },
    { value: 'custom', label: 'Custom' },
  ];

  const quickStartOptions = [
    { label: '5 min', duration: 5, icon: Coffee },
    { label: '15 min', duration: 15, icon: Target },
    { label: '30 min', duration: 30, icon: Target },
    { label: '50 min', duration: 50, icon: Target },
  ];

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="text-center space-y-6">
        {/* Timer Display */}
        <div className="relative">
          <div className="w-48 h-48 mx-auto relative">
            {/* Outer circle */}
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-border"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                className={sessionType === 'work' ? 'text-primary' : 'text-orange-500'}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Timer text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-mono font-bold">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {sessionType === 'work' ? 'Focus Time' : 'Break Time'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Session {currentSessionIndex}/{totalSessions}
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center justify-center space-x-4">
          <Select value={currentMode} onValueChange={(value) => switchMode(value as TimerMode)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-3">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="w-16 h-16 rounded-full"
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <Button
            onClick={resetSession}
            variant="outline"
            size="sm"
            className="w-12 h-12 rounded-full"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            onClick={skipSession}
            variant="outline"
            size="sm"
            className="w-12 h-12 rounded-full"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Start Options */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Quick Start</h4>
          <div className="flex items-center justify-center space-x-2">
            {quickStartOptions.map((option) => (
              <Button
                key={option.duration}
                onClick={() => startQuickSession()}
                variant="outline"
                size="sm"
                className="flex-1 max-w-[80px]"
              >
                <option.icon className="w-3 h-3 mr-1" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Distraction Logging */}
        {isRunning && (
          <Dialog open={showDistraction} onOpenChange={setShowDistraction}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Log Distraction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log a Distraction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  What interrupted your focus? Tracking distractions helps improve your productivity.
                </p>
                <Textarea
                  placeholder="Describe the distraction..."
                  value={distraction}
                  onChange={(e) => setDistraction(e.target.value)}
                />
                <Button 
                  onClick={handleLogDistraction} 
                  className="w-full"
                  disabled={logDistractionMutation.isPending || !distraction.trim()}
                >
                  {logDistractionMutation.isPending ? "Logging..." : "Log Distraction"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}