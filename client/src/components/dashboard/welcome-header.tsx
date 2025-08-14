import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export function WelcomeHeader() {
  const { user } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ['/api/analytics/stats'],
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const userName = user?.firstName || "there";

  return (
    <div className="bg-gradient-to-r from-primary/10 to-blue-500/5 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-muted-foreground mt-1">Ready to focus and get things done?</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats?.totalSessions || 0}
            </div>
            <div className="text-sm text-muted-foreground">Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {Math.round((stats?.totalHours || 0) * 7)} {/* Rough weekly estimate */}
            </div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {stats?.currentStreak || 0}
            </div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}
