import { Button } from "@/components/ui/button";
import { Brain, Timer, Coffee } from "lucide-react";
import { useTimer } from "@/hooks/use-timer";

export function QuickActions() {
  const { startQuickSession, switchMode } = useTimer();

  const quickSessionTypes = [
    {
      id: 'deep-work',
      title: 'Deep Work',
      description: '90 minute focus session',
      icon: Brain,
      color: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800',
      iconColor: 'bg-blue-500',
      textColor: 'text-blue-900 dark:text-blue-100',
      descColor: 'text-blue-600 dark:text-blue-300',
      duration: 90,
    },
    {
      id: 'pomodoro',
      title: 'Pomodoro',
      description: '25 min work + 5 min break',
      icon: Timer,
      color: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800',
      iconColor: 'bg-green-500',
      textColor: 'text-green-900 dark:text-green-100',
      descColor: 'text-green-600 dark:text-green-300',
      duration: 25,
    },
    {
      id: 'break',
      title: 'Break Time',
      description: '15 minute break',
      icon: Coffee,
      color: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800',
      iconColor: 'bg-purple-500',
      textColor: 'text-purple-900 dark:text-purple-100',
      descColor: 'text-purple-600 dark:text-purple-300',
      duration: 15,
    },
  ];

  const handleQuickStart = (sessionType: typeof quickSessionTypes[0]) => {
    if (sessionType.id === 'pomodoro') {
      switchMode('custom');
    } else if (sessionType.duration === 30) {
      switchMode('30min');
    } else {
      switchMode('50min');
    }
    startQuickSession();
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
      <div className="space-y-3">
        {quickSessionTypes.map((sessionType) => (
          <Button
            key={sessionType.id}
            variant="outline"
            className={`w-full p-3 h-auto justify-start transition-colors border ${sessionType.color}`}
            onClick={() => handleQuickStart(sessionType)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${sessionType.iconColor} rounded-lg flex items-center justify-center`}>
                <sessionType.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className={`font-medium ${sessionType.textColor}`}>{sessionType.title}</div>
                <div className={`text-sm ${sessionType.descColor}`}>{sessionType.description}</div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
