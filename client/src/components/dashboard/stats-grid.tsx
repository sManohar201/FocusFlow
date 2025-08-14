import { useQuery } from "@tanstack/react-query";
import { Clock, Target, Zap, TrendingUp } from "lucide-react";

export function StatsGrid() {
  const { data: stats } = useQuery({
    queryKey: ['/api/analytics/stats'],
  });

  const statItems = [
    {
      icon: Clock,
      value: stats ? `${(stats as any).totalHours?.toFixed(1) || 0}h` : "0h",
      label: "Hours This Week",
      color: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    },
    {
      icon: Target,
      value: stats ? `${Math.round((stats as any).completionRate || 0)}%` : "0%",
      label: "Completion Rate",
      color: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    },
    {
      icon: Zap,
      value: "45m", // Could be calculated from average session duration
      label: "Avg Session",
      color: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    },
    {
      icon: TrendingUp,
      value: "+12%",
      label: "vs Last Week",
      color: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div key={index} className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
