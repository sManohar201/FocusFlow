import { useQuery } from "@tanstack/react-query";
import { Check, Coffee, Clock, Smartphone, MessageCircle, Target, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Session, Distraction } from "@shared/schema";

export function RecentActivity() {
  const [showDistractionModal, setShowDistractionModal] = useState(false);

  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ['/api/sessions'],
  });

  // Mock distractions data - in real app would come from API
  const mockDistractions = [
    {
      id: "1",
      type: "Phone notification",
      description: "Social media alert",
      time: "2:15 PM",
      icon: Smartphone,
      color: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
      iconColor: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    },
    {
      id: "2",
      type: "Colleague interruption",
      description: "Quick question about project",
      time: "1:45 PM",
      icon: MessageCircle,
      color: "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800",
      iconColor: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    },
  ];

  const recentSessions = sessions.slice(0, 3);
  const todayDistractions = mockDistractions;

  const getSessionIcon = (type: string, completed: boolean) => {
    if (type === 'break') return Coffee;
    return completed ? Check : Clock;
  };

  const getSessionColor = (type: string, completed: boolean) => {
    if (type === 'break') return "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400";
    return completed 
      ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
      : "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
  };

  const formatSessionTime = (startTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minutes ago`;
    }
    return `${hours} hours ago`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Sessions */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
        <div className="space-y-3">
          {recentSessions.length > 0 ? (
            recentSessions.map((session) => {
              const SessionIcon = getSessionIcon(session.type, session.completed || false);
              const sessionColor = getSessionColor(session.type, session.completed || false);
              
              return (
                <div key={session.id} className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sessionColor}`}>
                    <SessionIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {session.type === 'work' ? 'Deep Work Session' : 'Break Time'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.duration} minutes • {session.completed ? 'Completed' : 'In Progress'}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatSessionTime(session.startTime)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No sessions yet</p>
              <p className="text-sm">Start a timer to see your session history</p>
            </div>
          )}
        </div>
      </div>

      {/* Distraction Log */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">Today's Distractions</h3>
        <div className="space-y-3">
          {todayDistractions.length > 0 ? (
            todayDistractions.map((distraction) => (
              <div key={distraction.id} className={`flex items-center justify-between p-3 rounded-lg border ${distraction.color}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${distraction.iconColor}`}>
                    <distraction.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{distraction.type}</div>
                    <div className="text-xs text-muted-foreground">{distraction.description}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{distraction.time}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              <Target className="w-5 h-5 mx-auto mb-2" />
              <div>Great focus today!</div>
              <div className="text-xs">No distractions logged</div>
            </div>
          )}
          
          {/* Quick Distraction Log */}
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowDistractionModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Log a distraction
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
