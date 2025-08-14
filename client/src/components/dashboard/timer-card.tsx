import { useTimer } from "@/hooks/use-timer";
import { Button } from "@/components/ui/button";
import { RotateCcw, SkipForward, Play, Pause } from "lucide-react";

export function TimerCard() {
  const {
    timeRemaining,
    isRunning,
    currentMode,
    currentSessionIndex,
    totalSessions,
    sessionType,
    progress,
    toggleTimer,
    skipSession,
    resetSession,
    switchMode,
  } = useTimer();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-6">Focus Timer</h2>
        
        {/* Timer Display */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="hsl(var(--muted))" 
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="hsl(var(--primary))" 
              strokeWidth="8" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{formatTime(timeRemaining)}</div>
            <div className="text-sm text-muted-foreground">
              {sessionType === 'work' ? 'Work Session' : 'Break Time'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Session {currentSessionIndex} of {totalSessions}
            </div>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={resetSession}
            className="rounded-full"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button
            onClick={toggleTimer}
            className="px-8 py-3 rounded-full font-medium"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={skipSession}
            className="rounded-full"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Mode Selection */}
        <div className="flex space-x-2">
          {(['50min', '30min', 'custom'] as const).map((mode) => (
            <Button
              key={mode}
              variant={currentMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => switchMode(mode)}
              className="flex-1"
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
